pipeline {
  agent any
  stages {
    stage('Print ENVs') {
      steps {
        sh 'printenv'
      }
    }
    stage('Build Image') {
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