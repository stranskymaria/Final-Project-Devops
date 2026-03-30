def isCiPullRequest() {
  return env.CHANGE_ID && (env.CHANGE_TARGET == 'main' || env.CHANGE_TARGET == 'release')
}

pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
    timeout(time: 20, unit: 'MINUTES')
    buildDiscarder(logRotator(numToKeepStr: '20'))
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

          if (isValidPr) {
            echo "Running CI for PR #${env.CHANGE_ID} from ${changeBranch} to ${changeTarget}."
          } else {
            currentBuild.description = 'Not a PR to main/release'
            echo 'Skipping Pipeline 1 checks because this build is not a PR targeting main or release.'
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
  }

  post {
    always {
      echo "Build finished with status: ${currentBuild.currentResult}"
    }
  }
}
