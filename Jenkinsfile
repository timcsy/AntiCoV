pipeline {
	agent none
	stages {
		stage('Frontend Build') {
			agent {
				dockerfile {
					filename 'Dockerfile'
					dir 'frontend'
					args '-p 80:3000'
				}
			}
			steps {
				sh './bin/frontened-build.sh'
			}
		}
	}
}
