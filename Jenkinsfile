pipeline {
    agent any
    environment {
        IMAGE_NAME = "infyshinetech/webui"
        FILE = "webui"
        KUBECONFIG = "C:\\Users\\infyshine\\.kube\\config"
    }

    stages {  
        stage('Checkout') {
            steps {
                script {
                    checkout scm
                }
            }
        }
        stage('get_commit_details') {
            steps {
                script {
                    GIT_COMMIT_MSG = bat (script: 'git log -1 --oneline', returnStdout: true).split('\r\n')[2].trim()
                    GIT_AUTHOR = bat (script: 'git log -1 --pretty=%%cn', returnStdout: true).split('\r\n')[2].trim()
                    GIT_EMAIL = bat (script: 'git log -1 --pretty=%%ae', returnStdout: true).split('\r\n')[2].trim()

                }
            }
        }
        

        stage('Verify Version and Type in DEV') {
            steps {
                script {
                    //getting deployedType(blue/green)
                    def deployedType = bat(script: """kubectl get pods -n dev --selector app=${FILE} -o custom-columns="VERSION:.metadata.labels.version" """, returnStdout: true).trim()
                    //getting deployedImage
                    def deployedImage = bat(script: """kubectl get pods -n dev --selector app=${FILE} -o custom-columns="IMAGE:.spec.containers[*].image" """, returnStdout: true).trim()

                    // Log the raw output for debugging
                    echo "Type Output: ${deployedType}"
                    echo "Image Output: ${deployedImage}"

                    // Extract the version value, skipping the header line
                    def typeLines = deployedType.split('\n')
                    if (typeLines.size() > 1) {
                        def type = typeLines[2].trim() // The version is on the third line
                        echo "Deployed Type: ${type}"
                        env.TYPE = type
                        } else {
                        error "Failed to retrieve Type information!"
                    }

                    def imageLines = deployedImage.split('\n')
                    if (imageLines.size() > 1) {
                        def devImage = imageLines[2].trim() // The version is on the third line
                        echo "Deployed Image: ${devImage}"
                        env.DEVIMAGE = devImage
                        } else {
                        error "Failed to retrieve Image information!"
                    }
                        def parts = env.DEVIMAGE.split("\\.")
                            int majorVersion = 0;
                            int minorVersion = 0;
                        if(parts.length >= 3){
                            majorVersion = Integer.parseInt(parts[1])
                            minorVersion = Integer.parseInt(parts[2])
                        }

                        // Increment the minor version or reset it and increment the major version if needed
                        if (minorVersion < 9) {
                            minorVersion++
                        } else {
                            minorVersion = 0
                            majorVersion++
                        }

                        def newVersion = "dev.${majorVersion}.${minorVersion}"
                        env.VERSION = newVersion
                        echo "newVersion: ${env.VERSION} "

                        def combinedVersion = majorVersion + (minorVersion / 10.0)
                        def delete = combinedVersion - 0.5

                        // Create the version string to be deleted
                        def toDeleteVersion = "dev.${delete}"
                        env.TODELETE = toDeleteVersion
                        echo "toDelete Version: ${env.TODELETE}"
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    // Building Docker image
                    docker.build("${IMAGE_NAME}:${env.VERSION}")
                }
            }
        }

        stage('Push to Docker Hub with #dev version') {
            steps {
                script {
                    withDockerRegistry(credentialsId: 'docker') {
                        docker.image("${IMAGE_NAME}:${env.VERSION}").push()

                        // Clean up the local images
                        bat "docker rmi ${IMAGE_NAME}:${env.VERSION}"
                    }
                }
            }
        }

        stage('Apply Kubernetes Configuration') {
            steps {
                script {
                    if (env.TYPE == "green"){
                        bat "kubectl apply -f E:DEV/DEV_BLUE/${FILE}-blue.yaml -n dev"
                        bat "kubectl patch deployment ${FILE}-blue -p \"{\\\"spec\\\": {\\\"template\\\": {\\\"spec\\\": {\\\"containers\\\": [{\\\"name\\\": \\\"${FILE}\\\", \\\"image\\\": \\\"${IMAGE_NAME}:${env.VERSION}\\\"}]}}}}\" -n dev"
                    }
                    else{
                        bat "kubectl apply -f E:DEV/DEV_GREEN/${FILE}-green.yaml -n dev"
                        bat "kubectl patch deployment ${FILE}-green -p \"{\\\"spec\\\": {\\\"template\\\": {\\\"spec\\\": {\\\"containers\\\": [{\\\"name\\\": \\\"${FILE}\\\", \\\"image\\\": \\\"${IMAGE_NAME}:${env.VERSION}\\\"}]}}}}\" -n dev"
                    }
                }
            }
        }

        stage('Checking Deployment Status') {
        steps {
            script {
                echo 'Pausing for 1 minute...'
                sleep(time: 1, unit: 'MINUTES')

                // Retrieve deployment status based on the type
                def deploymentStatus = ""
                if (env.TYPE == "green") {
                    deploymentStatus = bat(
                        script: "kubectl get deployment ${FILE}-blue -o jsonpath=\"{.status.conditions[?(@.type=='Available')].message}\" -n dev",
                        returnStdout: true
                    ).trim()
                } else {
                    deploymentStatus = bat(
                        script: "kubectl get deployment ${FILE}-green -o jsonpath=\"{.status.conditions[?(@.type=='Available')].message}\" -n dev",
                        returnStdout: true
                    ).trim()
                }

                        def statusLines = deploymentStatus.split('\n')
                        def status = statusLines[1].trim()

                echo "Deployment Status: ${status}"

                // Check if deployment is in the desired state
                if (status == "Deployment has minimum availability.") {
                    echo "Deployment is running as expected."
                } else {
                    if (env.TYPE == "green") {
                        echo "New deployment is not running. Cleaning up the blue deployment."
                        bat "kubectl delete -f E:DEV/DEV_BLUE/${FILE}-blue.yaml -n dev"
                    } else {
                        echo "New deployment is not running. Cleaning up the green deployment."
                        bat "kubectl delete -f E:DEV/DEV_GREEN/${FILE}-green.yaml -n dev"
                    }
                    error "New deployment is not in a running state."
                }
            }
        }
    }


        stage('Switch Service Selector') {
            steps {
                script {

                    if (env.TYPE == "green") {
                        bat "kubectl patch service ${FILE}-service -p \"{\\\"spec\\\": {\\\"selector\\\": {\\\"app\\\": \\\"${FILE}\\\", \\\"version\\\": \\\"blue\\\"}}}\" -n dev"
                        bat "kubectl patch hpa ${FILE}-hpa --type=json -p \"[{\\\"op\\\": \\\"replace\\\", \\\"path\\\": \\\"/spec/scaleTargetRef/name\\\", \\\"value\\\": \\\"${FILE}-blue\\\"}]\" -n dev"
                    } else {
                        bat "kubectl patch service ${FILE}-service -p \"{\\\"spec\\\": {\\\"selector\\\": {\\\"app\\\": \\\"${FILE}\\\", \\\"version\\\": \\\"green\\\"}}}\" -n dev"
                        bat "kubectl patch hpa ${FILE}-hpa --type=json -p \"[{\\\"op\\\": \\\"replace\\\", \\\"path\\\": \\\"/spec/scaleTargetRef/name\\\", \\\"value\\\": \\\"${FILE}-green\\\"}]\" -n dev"
                    }
                }
            }
        }

        stage('Removing Old Deployment') {
            steps {
                script {
                    if (env.TYPE == "green"){
                        bat "kubectl delete -f E:DEV/DEV_GREEN/${FILE}-green.yaml -n dev"
                    }
                    else{
                        bat "kubectl delete -f E:DEV/DEV_BLUE/${FILE}-blue.yaml -n dev"
                    }

                }
            }
        }

        stage('Remove old version from Repository') {
            steps {
                script {
                    withCredentials([string(credentialsId: 'docker-token', variable: 'DOCKER_TOKEN')]) {
                        bat """
                            C:\\Windows\\System32\\curl -X DELETE -H "Authorization: Bearer ${DOCKER_TOKEN}" https://hub.docker.com/v2/repositories/infyshinetech/${FILE}/tags/${env.TODELETE}/
                        """
                    }
                }
            }
        }

        
    }

    post {
        success {
            script {
                def attachments = 'trivy-report.txt,trivy-docker-image-report.txt'
                emailext(
                to: 'java@infyshine.com, devops@infyshine.com',
                subject: "Build Success_${JOB_NAME}_${env.BUILD_NUMBER}",
                body: """<!DOCTYPE html>
                        <html>
                        <style>
                        table, th, td { border:1px solid black; border-style: none; }
                        </style>
                        <body>
                        <div>
                    <p style="background-color: green; text-align: center; color: aliceblue; height: 30px; font-size: 20px; padding-top: 5px;">
                        SUCCESS
                    </p>
                </div>
                        <table style="width:100%">
                            <tr><td>Build Status</td><td>: Success</td></tr>
                            <tr><td>Job</td><td>: ${JOB_NAME}</td></tr>
                            <tr><td>Build Number</td><td>: ${env.BUILD_NUMBER}</td></tr>
                            <tr><td>Image Version</td><td>: ${env.VERSION}</td></tr>
                            <tr><td>Build URL</td><td>: <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></td></tr>
                            <tr><td>Committed by</td><td>: ${GIT_EMAIL}</td></tr>
                            <tr><td>Last commit message</td><td>: ${GIT_COMMIT_MSG}</td></tr>
                        </table>
                        <div>
                    <p style="background-color: rgb(228, 228, 230); text-align: center; color: rgb(11, 12, 12); height: 30px; font-size: 20px; padding-top: 5px;">
                        Note*: Please refer above for Build Logs and Tivy Scan Report
                    </p>
                </div>
                        </body>
                        </html>""",
                mimeType: 'text/html',
                from: 'buildnotifications@workshine.com',
                attachmentsPattern: attachments,
                attachLog: true
            )
            }
        }
        failure {
            script {
                echo "Deployment failed. Rolling Back..."
                if (env.TYPE == "green") {
                    bat "kubectl delete -f E:DEV/DEV_BLUE/${FILE}-blue.yaml -n dev"
                } else {
                    bat "kubectl delete -f E:DEV/DEV_GREEN/${FILE}-green.yaml -n dev"
                }
                def attachments = 'trivy-report.txt,trivy-docker-image-report.txt'
                emailext(
                to: 'java@infyshine.com, devops@infyshine.com',
                subject: "Build Failed_${JOB_NAME}_${env.BUILD_NUMBER}",
                body: """<!DOCTYPE html>
                        <html>
                        <style>
                        table, th, td { border:1px solid black; border-style: none; }
                        </style>
                        <body>
                        <div>
                    <p style="background-color: red; text-align: center; color: aliceblue; height: 30px; font-size: 20px; padding-top: 5px;">
                        FAILED
                    </p>
                </div>
                        <table style="width:100%">
                            <tr><td>Build Status</td><td>: Failed</td></tr>
                            <tr><td>Job</td><td>: ${JOB_NAME}</td></tr>
                            <tr><td>Build Number</td><td>: ${env.BUILD_NUMBER}</td></tr>
                            <tr><td>Image Version</td><td>: ${env.VERSION}</td></tr>
                            <tr><td>Build URL</td><td>: <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></td></tr>
                            <tr><td>Committed by</td><td>: ${GIT_EMAIL}</td></tr>
                            <tr><td>Last commit message</td><td>: ${GIT_COMMIT_MSG}</td></tr>
                        </table>
                        <div>
                    <p style="background-color: rgb(228, 228, 230); text-align: center; color: rgb(11, 12, 12); height: 30px; font-size: 20px; padding-top: 5px;">
                        Note*: Please refer above for Build Logs and Tivy Scan Report
                    </p>
                </div>
                        </body>
                        </html>""",
                mimeType: 'text/html',
                from: 'buildnotifications@workshine.com',
                attachmentsPattern: attachments,
                attachLog: true
            )
            }
        }
    }    
}