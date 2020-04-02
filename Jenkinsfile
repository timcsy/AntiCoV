pipeline {
	agent any
	stages {
		stage('Frontend Build') {
			agent {
				dockerfile {
					filename 'Dockerfile'
					dir 'frontend'
					args '-p 49600:80'
				}
			}
			steps {
				sh './bin/frontened-build.sh'
				input message: 'Finished using the web site? (Click "Proceed" to continue)'
			}
		}
	}
}
