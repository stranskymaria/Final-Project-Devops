pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  environment {
    IS_PR_TO_MAIN_OR_RELEASE = 'false'
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
          def isValidPr = env.CHANGE_ID && changeBranch == 'development' && (changeTarget == 'main' || changeTarget == 'release')

          if (isValidPr) {
            env.IS_PR_TO_MAIN_OR_RELEASE = 'true'
            echo "Running CI for PR #${env.CHANGE_ID} from ${changeBranch} to ${changeTarget}."
          } else {
            currentBuild.description = 'Not a PR from development to main/release'
            echo 'Skipping Pipeline 1 checks because this build is not a PR from development to main or release.'
          }
        }
      }
    }

    stage('Backend Lint') {
      when {
        environment name: 'IS_PR_TO_MAIN_OR_RELEASE', value: 'true'
      }
      steps {
        dir('SimpleNotesAPI') {
          sh 'npm ci'
          sh 'npm run lint'
        }
      }
    }

    stage('Backend Tests') {
      when {
        environment name: 'IS_PR_TO_MAIN_OR_RELEASE', value: 'true'
      }
      steps {
        dir('SimpleNotesAPI') {
          sh 'npm run test:unit'
        }
      }
    }

    stage('Frontend Lint') {
      when {
        environment name: 'IS_PR_TO_MAIN_OR_RELEASE', value: 'true'
      }
      steps {
        dir('SimpleNotesUI') {
          sh 'npm ci'
          sh 'npm run lint'
        }
      }
    }

    stage('Frontend Tests') {
      when {
        environment name: 'IS_PR_TO_MAIN_OR_RELEASE', value: 'true'
      }
      steps {
        dir('SimpleNotesUI') {
          sh 'npm test -- --run'
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
