// Jenkinsfile (igual para ci/cd y feature/ci-demo)
def branchName() {
  // Multibranch: BRANCH_NAME. Pipeline-from-SCM: suele venir GIT_BRANCH (origin/xxx)
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
        // Respeta packageManager: npm@11.9.0 si Corepack está disponible
        sh "corepack enable || true"
        sh "corepack prepare npm@11.9.0 --activate || true"
        sh "npm ci"
      }
    }
    stage("Quality") {
      parallel {
        stage("Lint (Prettier)") {
          steps {
            sh "npx prettier -c ."
          }
        }
        stage("Test") {
          steps {
            // Usa el target test configurado en angular.json (@angular/build:unit-test)
            // --watch=false para que no quede esperando en CI
            sh "npm test -- --watch=false"
          }
        }
        stage("Audit") {
          steps {
            // No rompe el build, pero lo marca UNSTABLE si encuentra issues
            catchError(buildResult: "SUCCESS", stageResult: "UNSTABLE") {
              sh "npm audit --audit-level=high"
            }
          }
        }
      }
    }
    stage("Build") {
      when {
        expression { shouldBuildAndArchive() }
      }
      steps {
        sh "npm run build"
      }
    }
    stage("Archive") {
      when {
        expression { shouldBuildAndArchive() }
      }
      steps {
        archiveArtifacts artifacts: "dist/**", fingerprint: true, allowEmptyArchive: true
      }
    }
  }
  post {
    always {
      echo "Branch: ${branchName()} | Build+Archive: ${shouldBuildAndArchive()}"
    }
  }
}
