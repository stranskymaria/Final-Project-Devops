import groovy.json.JsonOutput

def isCiPullRequest() {
  return env.CHANGE_ID && (env.CHANGE_TARGET == 'main' || env.CHANGE_TARGET == 'release')
}

def getGithubRepoSlug() {
  def changeUrl = env.CHANGE_URL ?: ''
  def matcher = (changeUrl =~ /github\.com\/([^\/]+\/[^\/]+)\/pull\/\d+/)
  return matcher ? matcher[0][1] : ''
}

def isMergePullRequestBuild() {
  def jobName = env.JOB_NAME ?: ''
  return isCiPullRequest() && jobName.contains('-merge')
}

def isStagingBranchBuild() {
  return !env.CHANGE_ID && (env.BRANCH_NAME == 'main' || env.BRANCH_NAME == 'release')
}

pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
    timeout(time: 20, unit: 'MINUTES')
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  environment {
    REGISTRY = 'ghcr.io'
    IMAGE_NAMESPACE = 'ghcr.io/stranskymaria'
    API_IMAGE_NAME = 'simplenotes-api'
    UI_IMAGE_NAME = 'simplenotes-ui'
    STAGING_HOST = '192.168.2.6'
    STAGING_PATH = '/home/ubuntu/simplenotes-staging'
    STAGING_DB_HOST = '192.168.2.7'
    STAGING_DB_USER = 'appuser'
    STAGING_DB_NAME = 'notes_db'
    STAGING_TEST_DB_NAME = 'notes_db_test'
    STAGING_API_PORT = '3001'
    STAGING_UI_PORT = '5173'
    STAGING_VITE_API_URL = 'http://192.168.2.6:3001/api'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Validate Trigger') {
      steps {
        script {
          def changeBranch = env.CHANGE_BRANCH ?: ''
          def changeTarget = env.CHANGE_TARGET ?: ''
          def isValidPr = isCiPullRequest()
          def isStagingBuild = isStagingBranchBuild()

          if (isValidPr) {
            echo "Running CI for PR #${env.CHANGE_ID} from ${changeBranch} to ${changeTarget}."
          } else if (isStagingBuild) {
            echo "Running staging deployment flow for branch ${env.BRANCH_NAME}."
          } else {
            currentBuild.description = 'Not a PR to main/release or a staging branch build'
            echo 'Skipping CI/CD stages because this build is neither a PR to main/release nor a direct build on main/release.'
          }
        }
      }
    }

    stage('Install Dependencies') {
      when {
        expression {
          return isCiPullRequest()
        }
      }
      parallel {
        stage('Install Backend Dependencies') {
          steps {
            dir('SimpleNotesAPI') {
              sh 'npm ci'
            }
          }
        }

        stage('Install Frontend Dependencies') {
          steps {
            dir('SimpleNotesUI') {
              sh 'npm ci --legacy-peer-deps'
            }
          }
        }
      }
    }

    stage('Quality Checks') {
      when {
        expression {
          return isCiPullRequest()
        }
      }
      failFast true
      parallel {
        stage('Backend Lint') {
          steps {
            dir('SimpleNotesAPI') {
              sh 'npm run lint'
            }
          }
        }

        stage('Backend Tests') {
          steps {
            dir('SimpleNotesAPI') {
              sh 'npm run test:unit'
            }
          }
        }

        stage('Frontend Lint') {
          steps {
            dir('SimpleNotesUI') {
              sh 'npm run lint'
            }
          }
        }

        stage('Frontend Tests') {
          steps {
            dir('SimpleNotesUI') {
              sh 'npm test -- --run'
            }
          }
        }
      }
    }

    stage('Prepare Staging Metadata') {
      when {
        expression {
          return isStagingBranchBuild()
        }
      }
      steps {
        script {
          env.APP_BUILD_SHA = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
          env.API_IMAGE = "${env.IMAGE_NAMESPACE}/${env.API_IMAGE_NAME}:${env.APP_BUILD_SHA}"
          env.UI_IMAGE = "${env.IMAGE_NAMESPACE}/${env.UI_IMAGE_NAME}:${env.APP_BUILD_SHA}"
          echo "Prepared staging image tags ${env.API_IMAGE} and ${env.UI_IMAGE}."
        }
      }
    }

    stage('Build and Push Images') {
      when {
        expression {
          return isStagingBranchBuild()
        }
      }
      stages {
        stage('Registry Login') {
          steps {
            withCredentials([usernamePassword(
              credentialsId: 'github-creds',
              usernameVariable: 'GITHUB_USERNAME',
              passwordVariable: 'GITHUB_TOKEN',
            )]) {
              sh '''
                echo "$GITHUB_TOKEN" | docker login "$REGISTRY" -u "$GITHUB_USERNAME" --password-stdin
              '''
            }
          }
        }

        stage('Build and Push In Parallel') {
          parallel {
            stage('Build and Push Backend') {
              steps {
                sh """
                  docker build -t "${API_IMAGE}" -f SimpleNotesAPI/Dockerfile .
                  docker push "${API_IMAGE}"
                """
              }
            }

            stage('Build and Push Frontend') {
              steps {
                sh """
                  docker build -t "${UI_IMAGE}" -f SimpleNotesUI/Dockerfile .
                  docker push "${UI_IMAGE}"
                """
              }
            }
          }
        }
      }
    }

    stage('Deploy to Staging') {
      when {
        expression {
          return isStagingBranchBuild()
        }
      }
      steps {
        withCredentials([
          usernamePassword(
            credentialsId: 'github-creds',
            usernameVariable: 'GITHUB_USERNAME',
            passwordVariable: 'GITHUB_TOKEN',
          ),
          sshUserPrivateKey(
            credentialsId: 'staging-ssh',
            keyFileVariable: 'SSH_KEY_FILE',
            usernameVariable: 'STAGING_SSH_USER',
          ),
          string(
            credentialsId: 'staging-db-password',
            variable: 'STAGING_DB_PASSWORD',
          ),
        ]) {
          sh 'bash scripts/deploy-staging.sh'
        }
      }
    }

    stage('Staging Smoke Tests') {
      when {
        expression {
          return isStagingBranchBuild()
        }
      }
      steps {
        sh '''
          curl -fsS "http://192.168.2.6:3001/api/health"
          curl -fsS "http://192.168.2.6:3001/api/notes"
          curl -fsSI "http://192.168.2.6:5173"
        '''
      }
    }
  }

  post {
    failure {
      script {
        if (isMergePullRequestBuild()) {
          def repoSlug = getGithubRepoSlug()

          if (!repoSlug) {
            echo 'Skipping PR failure comment because the GitHub repository slug could not be determined from CHANGE_URL.'
            return
          }

          def prComment = """CI checks failed for this pull request.

- Build: ${env.BUILD_URL}
- PR: #${env.CHANGE_ID}
- Source branch: ${env.CHANGE_BRANCH}
- Target branch: ${env.CHANGE_TARGET}

Please review the Jenkins build log and fix the failing stage before merging."""

          writeFile(
            file: 'pr-comment.json',
            text: JsonOutput.toJson([body: prComment]),
          )

          withCredentials([usernamePassword(
            credentialsId: 'github-creds',
            usernameVariable: 'GITHUB_USERNAME',
            passwordVariable: 'GITHUB_TOKEN',
          )]) {
            sh """
              curl -sS \
                -u "$GITHUB_USERNAME:$GITHUB_TOKEN" \
                -H "Accept: application/vnd.github+json" \
                -H "X-GitHub-Api-Version: 2022-11-28" \
                -X POST \
                "https://api.github.com/repos/${repoSlug}/issues/${env.CHANGE_ID}/comments" \
                --data @pr-comment.json
            """
          }
        } else if (isCiPullRequest()) {
          echo 'Skipping PR failure comment for the head build; the merge build is responsible for posting the PR comment.'
        }
      }
    }

    always {
      echo "Build finished with status: ${currentBuild.currentResult}"
    }
  }
}
