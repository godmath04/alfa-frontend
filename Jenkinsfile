@Library('mi-lib') _

def branchName() {
  def b = (env.BRANCH_NAME ?: env.GIT_BRANCH ?: "")
  return b.replaceFirst(/^origin\//, "")
}

def shouldBuildAndArchive() {
  def b = branchName()
  return (b == "ci/cd" || b == "main" || b == "master" || b.startsWith("release/"))
}

pipeline {
  agent any
  tools {
    nodejs "Node-22.22.2"
  }
  options {
    timestamps()
    skipDefaultCheckout(true)
    disableConcurrentBuilds()
  }
  environment {
    CI = "true"
  }
  stages {
    stage("Checkout") {
      steps {
        checkout scm
        sh "node -v"
        sh "npm -v"
      }
    }
    stage("Install") {
      steps {
        nodeUtils.install()
      }
    }
    stage("Quality") {
      parallel {
        stage("Lint (Prettier)") {
          steps { nodeUtils.lint() }
        }
        stage("Test") {
          steps { nodeUtils.test() }
        }
        stage("Audit") {
          steps { nodeUtils.audit() }
        }
      }
    }
    stage("Build & Archive") {
      when {
        expression { shouldBuildAndArchive() }
      }
      steps {
        buildAngular()
      }
    }
  }
  post {
    always {
      echo "Branch: ${branchName()} | Build+Archive: ${shouldBuildAndArchive()}"
    }
  }
}
