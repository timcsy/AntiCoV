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
				sh 'echo $! > .pidfile'
				input message: 'Finished using the web site? (Click "Proceed" to continue)'
				sh 'kill $(cat .pidfile)'
			}
		}
	}
}
