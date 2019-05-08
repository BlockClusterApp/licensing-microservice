pipeline {
  agent any
  stages {
    stage('Build Image') {
      agent {
        docker {
          image 'circleci/node:8.9'
        }

      }
      steps {
        sh './.circleci/docker-build.sh'
      }
    }
    stage('Docker Push') {
      steps {
        sh './.circleci/docker-push.sh'
      }
    }
  }
}