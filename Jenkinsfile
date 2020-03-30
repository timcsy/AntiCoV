pipeline {
	agent none
	stages {
		stage('Frontend') {
			agent {
				dockerfile {
					dir 'frontend'
					filename 'Dockerfile'
					label 'frontend'
					args '-p 3000:80'
				}
			}
			stages {
				stage('Frontend Build') {
					steps {
						echo 'Start Frontend!'
					}
				}
			}
		}
	}
}
