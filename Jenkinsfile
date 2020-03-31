pipeline {
	agent none
	stages {
		stage('Frontend Build') {
			agent {
				dockerfile {
					filename 'Dockerfile'
					dir 'frontend'
					label 'frontend'
					args '-p 3000:80'
				}
			}
			steps {
				sh './bin/frontened-build.sh'
			}
		}
	}
}
