pipeline {
    agent any
    
    environment {
        // Docker Hub credentials - configure these in Jenkins credentials
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        DOCKER_REGISTRY = 'docker.io'
        IMAGE_NAME_FRONTEND = 'songify-frontend'
        IMAGE_NAME_BACKEND = 'songify-backend'
        
        // Build configuration
        NODE_VERSION = '18'
        DOCKER_BUILDKIT = '1'
        
        // Environment-specific settings
        FRONTEND_PORT = '80'
        BACKEND_PORT = '3000'
        
        // OS Detection
        IS_WINDOWS = "${isUnix() ? 'false' : 'true'}"
    }
    
    options {
        // Keep builds for 30 days or last 10 builds
        buildDiscarder(logRotator(daysToKeepStr: '30', numToKeepStr: '10'))
        // Timeout the build after 10 minutes
        timeout(time: 10, unit: 'MINUTES')
        // Skip default checkout to use custom checkout
        skipDefaultCheckout()
    }
    
    stages {
        stage('Checkout Code') {
            steps {
                script {
                    echo "Starting CI/CD Pipeline for Songify"
                    echo "Build Number: ${env.BUILD_NUMBER}"
                    echo "Branch: ${env.BRANCH_NAME ?: env.GIT_BRANCH}"
                }
                
                // Clean workspace and checkout code
                cleanWs()
                checkout scm
                
                script {
                    // Set image tags based on branch
                    if (env.BRANCH_NAME == 'main' || env.BRANCH_NAME == 'master') {
                        env.IMAGE_TAG = 'latest'
                        env.ADDITIONAL_TAG = "v${env.BUILD_NUMBER}"
                    } else {
                        env.IMAGE_TAG = "${env.BRANCH_NAME}-${env.BUILD_NUMBER}".replaceAll('/', '-')
                        env.ADDITIONAL_TAG = "${env.BRANCH_NAME}-latest".replaceAll('/', '-')
                    }
                    
                    echo "Image tags: ${env.IMAGE_TAG}, ${env.ADDITIONAL_TAG}"
                }
            }
        }

        stage('Checkmarx AST Scan') {
            steps {
                script {
                    checkmarxASTScanner(
                        useOwnAdditionalOptions: true, 
                        additionalOptions: '--sast-incremental=true', 
                        serverUrl: 'https://ind.ast.checkmarx.net/', 
                        baseAuthUrl: 'https://ind.iam.checkmarx.net/', 
                        tenantName: "${env.CX_TENANT}", 
                        branchName: 'develop', 
                        checkmarxInstallation: 'CxAST CLI', 
                        projectName: 'dhruvspathak/Songify',
                        //additionalParameter: '--threshold "sast-high=10; sast-medium=20; sca-high=10; containers-high=5"'
                    )
                }
            }
        }
        
        stage('Prepare Environment') {
            steps {
                script {
                    echo "Setting up build environment..."
                    echo "Operating System: ${isUnix() ? 'Unix/Linux' : 'Windows'}"
                    
                    // Create environment template files if they don't exist
                    if (isUnix()) {
                        sh '''
                            # Create .env templates for build process
                            if [ ! -f backend/.env ]; then
                                echo "Creating backend .env from template..."
                                cp backend/env.template backend/.env || echo "No backend env template found"
                            fi
                            
                            if [ ! -f frontend/.env ]; then
                                echo "Creating frontend .env from template..."
                                cp frontend/env.template frontend/.env || echo "No frontend env template found"
                            fi
                            
                            # Display project structure
                            echo "Project structure:"
                            find . -type f -name "package.json" | head -10
                            find . -type f -name "Dockerfile" | head -10
                        '''
                    } else {
                        bat '''
                            @echo off
                            REM Create .env templates for build process
                            if not exist backend\\.env (
                                echo Creating backend .env from template...
                                copy backend\\env.template backend\\.env 2>nul || echo No backend env template found
                            )
                            
                            if not exist frontend\\.env (
                                echo Creating frontend .env from template...
                                copy frontend\\env.template frontend\\.env 2>nul || echo No frontend env template found
                            )
                            
                            REM Display project structure
                            echo Project structure:
                            dir /s /b package.json 2>nul | findstr /v node_modules
                            dir /s /b Dockerfile 2>nul
                        '''
                    }
                }
            }
        }
        
        stage('Install Dependencies & Test') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        dir('backend') {
                            script {
                                echo "Installing backend dependencies and running tests..."
                                if (isUnix()) {
                                    sh '''
                                        # Install Node.js dependencies
                                        npm ci --only=dev
                                        
                                        # Run linting if available
                                        if npm list eslint &>/dev/null; then
                                            echo "Running ESLint..."
                                            npm run lint || echo "Linting failed but continuing..."
                                        fi
                                        
                                        # Run tests if available
                                        if grep -q '"test"' package.json && ! grep -q 'echo.*Error.*no test' package.json; then
                                            echo "Running backend tests..."
                                            npm test
                                        else
                                            echo "No tests configured for backend"
                                        fi
                                        
                                        # Security audit
                                        echo "Running security audit..."
                                        npm audit --audit-level high || echo "Security audit completed with warnings"
                                    '''
                                } else {
                                    bat '''
                                        @echo off
                                        echo Installing Node.js dependencies...
                                        npm ci --only=dev
                                        
                                        echo Checking for ESLint...
                                        npm list eslint >nul 2>&1
                                        if not errorlevel 1 (
                                            echo Running ESLint...
                                            npm run lint || echo Linting failed but continuing...
                                        )
                                        
                                        echo Checking for tests...
                                        findstr /c:"test" package.json >nul 2>&1
                                        if not errorlevel 1 (
                                            findstr /c:"echo.*Error.*no test" package.json >nul 2>&1
                                            if errorlevel 1 (
                                                echo Running backend tests...
                                                npm test
                                            ) else (
                                                echo No tests configured for backend
                                            )
                                        ) else (
                                            echo No tests configured for backend
                                        )
                                        
                                        echo Running security audit...
                                        npm audit --audit-level high || echo Security audit completed with warnings
                                    '''
                                }
                            }
                        }
                    }
                }
                
                stage('Frontend Tests') {
                    steps {
                        dir('frontend') {
                            script {
                                echo "Installing frontend dependencies and running tests..."
                                if (isUnix()) {
                                    sh '''
                                        # Install Node.js dependencies
                                        npm ci
                                        
                                        # Run linting
                                        if npm list eslint &>/dev/null; then
                                            echo "Running ESLint..."
                                            npm run lint || echo "Linting failed but continuing..."
                                        fi
                                        
                                        # Run tests if available
                                        if grep -q '"test"' package.json && ! grep -q 'echo.*Error.*no test' package.json; then
                                            echo "Running frontend tests..."
                                            npm test
                                        else
                                            echo "No tests configured for frontend"
                                        fi
                                        
                                        # Build frontend to verify it compiles
                                        echo "Building frontend for verification..."
                                        npm run build
                                        
                                        # Security audit
                                        echo "Running security audit..."
                                        npm audit --audit-level high || echo "Security audit completed with warnings"
                                    '''
                                } else {
                                    bat '''
                                        @echo off
                                        echo Installing Node.js dependencies...
                                        npm ci
                                        
                                        echo Checking for ESLint...
                                        npm list eslint >nul 2>&1
                                        if not errorlevel 1 (
                                            echo Running ESLint...
                                            npm run lint || echo Linting failed but continuing...
                                        )
                                        
                                        echo Checking for tests...
                                        findstr /c:"test" package.json >nul 2>&1
                                        if not errorlevel 1 (
                                            findstr /c:"echo.*Error.*no test" package.json >nul 2>&1
                                            if errorlevel 1 (
                                                echo Running frontend tests...
                                                npm test
                                            ) else (
                                                echo No tests configured for frontend
                                            )
                                        ) else (
                                            echo No tests configured for frontend
                                        )
                                        
                                        echo Building frontend for verification...
                                        npm run build
                                        
                                        echo Running security audit...
                                        npm audit --audit-level high || echo Security audit completed with warnings
                                    '''
                                }
                            }
                        }
                    }
                }
            }
        }
        
        stage('Build Docker Images') {
            parallel {
                stage('Build Backend Image') {
                    steps {
                        dir('backend') {
                            script {
                                echo "Building backend Docker image..."
                                if (isUnix()) {
                                    sh """
                                        # Build backend image
                                        docker build \\
                                            --tag ${DOCKERHUB_CREDENTIALS_USR}/${IMAGE_NAME_BACKEND}:${env.IMAGE_TAG} \\
                                            --tag ${DOCKERHUB_CREDENTIALS_USR}/${IMAGE_NAME_BACKEND}:${env.ADDITIONAL_TAG} \\
                                            --label "build.number=${env.BUILD_NUMBER}" \\
                                            --label "build.branch=${env.BRANCH_NAME ?: 'unknown'}" \\
                                            --label "build.commit=${env.GIT_COMMIT ?: 'unknown'}" \\
                                            --label "build.date=\$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \\
                                            .
                                        
                                        # Verify image was created
                                        docker images ${DOCKERHUB_CREDENTIALS_USR}/${IMAGE_NAME_BACKEND}
                                    """
                                } else {
                                    bat """
                                        @echo off
                                        REM Build backend image
                                        docker build ^
                                            --tag ${DOCKERHUB_CREDENTIALS_USR}/${IMAGE_NAME_BACKEND}:${env.IMAGE_TAG} ^
                                            --tag ${DOCKERHUB_CREDENTIALS_USR}/${IMAGE_NAME_BACKEND}:${env.ADDITIONAL_TAG} ^
                                            --label "build.number=${env.BUILD_NUMBER}" ^
                                            --label "build.branch=${env.BRANCH_NAME ?: 'unknown'}" ^
                                            --label "build.commit=${env.GIT_COMMIT ?: 'unknown'}" ^
                                            --label "build.date=%date:~10,4%-%date:~4,2%-%date:~7,2%T%time:~0,2%:%time:~3,2%:%time:~6,2%Z" ^
                                            .
                                        
                                        REM Verify image was created
                                        docker images ${DOCKERHUB_CREDENTIALS_USR}/${IMAGE_NAME_BACKEND}
                                    """
                                }
                            }
                        }
                    }
                }
                
                stage('Build Frontend Image') {
                    steps {
                        dir('frontend') {
                            script {
                                echo "Building frontend Docker image..."
                                if (isUnix()) {
                                    sh """
                                        # Build frontend image
                                        docker build \\
                                            --tag ${DOCKERHUB_CREDENTIALS_USR}/${IMAGE_NAME_FRONTEND}:${env.IMAGE_TAG} \\
                                            --tag ${DOCKERHUB_CREDENTIALS_USR}/${IMAGE_NAME_FRONTEND}:${env.ADDITIONAL_TAG} \\
                                            --label "build.number=${env.BUILD_NUMBER}" \\
                                            --label "build.branch=${env.BRANCH_NAME ?: 'unknown'}" \\
                                            --label "build.commit=${env.GIT_COMMIT ?: 'unknown'}" \\
                                            --label "build.date=\$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \\
                                            .
                                        
                                        # Verify image was created
                                        docker images ${DOCKERHUB_CREDENTIALS_USR}/${IMAGE_NAME_FRONTEND}
                                    """
                                } else {
                                    bat """
                                        @echo off
                                        REM Build frontend image
                                        docker build ^
                                            --tag ${DOCKERHUB_CREDENTIALS_USR}/${IMAGE_NAME_FRONTEND}:${env.IMAGE_TAG} ^
                                            --tag ${DOCKERHUB_CREDENTIALS_USR}/${IMAGE_NAME_FRONTEND}:${env.ADDITIONAL_TAG} ^
                                            --label "build.number=${env.BUILD_NUMBER}" ^
                                            --label "build.branch=${env.BRANCH_NAME ?: 'unknown'}" ^
                                            --label "build.commit=${env.GIT_COMMIT ?: 'unknown'}" ^
                                            --label "build.date=%date:~10,4%-%date:~4,2%-%date:~7,2%T%time:~0,2%:%time:~3,2%:%time:~6,2%Z" ^
                                            .
                                        
                                        REM Verify image was created
                                        docker images ${DOCKERHUB_CREDENTIALS_USR}/${IMAGE_NAME_FRONTEND}
                                    """
                                }
                            }
                        }
                    }
                }
            }
        }
        
        stage('Test Docker Images') {
            steps {
                script {
                    echo "Testing Docker images..."
                    if (isUnix()) {
                        sh """
                            # Test backend image
                            echo "Testing backend image..."
                            docker run --rm --name test-backend -d \\
                                -p 3001:3000 \\
                                ${DOCKERHUB_CREDENTIALS_USR}/${IMAGE_NAME_BACKEND}:${env.IMAGE_TAG}
                            
                            # Wait for backend to start
                            sleep 10
                            
                            # Basic health check for backend
                            if docker ps | grep test-backend; then
                                echo "Backend container is running"
                                docker stop test-backend || true
                            else
                                echo "Backend container failed to start"
                                docker logs test-backend || true
                                docker stop test-backend || true
                                exit 1
                            fi
                            
                            # Test frontend image
                            echo "Testing frontend image..."
                            docker run --rm --name test-frontend -d \\
                                -p 8081:80 \\
                                ${DOCKERHUB_CREDENTIALS_USR}/${IMAGE_NAME_FRONTEND}:${env.IMAGE_TAG}
                            
                            # Wait for frontend to start
                            sleep 5
                            
                            # Basic health check for frontend
                            if docker ps | grep test-frontend; then
                                echo "Frontend container is running"
                                docker stop test-frontend || true
                            else
                                echo "Frontend container failed to start"
                                docker logs test-frontend || true
                                docker stop test-frontend || true
                                exit 1
                            fi
                            
                            echo "All Docker images tested successfully"
                        """
                    } else {
                        bat """
                            @echo off
                            REM Test backend image
                            echo Testing backend image...
                            docker run --rm --name test-backend -d ^
                                -p 3001:3000 ^
                                ${DOCKERHUB_CREDENTIALS_USR}/${IMAGE_NAME_BACKEND}:${env.IMAGE_TAG}
                            
                            REM Wait for backend to start
                            timeout /t 10 /nobreak >nul
                            
                            REM Basic health check for backend
                            docker ps | findstr test-backend >nul 2>&1
                            if not errorlevel 1 (
                                echo Backend container is running
                                docker stop test-backend 2>nul || echo Container already stopped
                            ) else (
                                echo Backend container failed to start
                                docker logs test-backend 2>nul || echo No logs available
                                docker stop test-backend 2>nul || echo Container already stopped
                                exit /b 1
                            )
                            
                            REM Test frontend image
                            echo Testing frontend image...
                            docker run --rm --name test-frontend -d ^
                                -p 8081:80 ^
                                ${DOCKERHUB_CREDENTIALS_USR}/${IMAGE_NAME_FRONTEND}:${env.IMAGE_TAG}
                            
                            REM Wait for frontend to start
                            timeout /t 5 /nobreak >nul
                            
                            REM Basic health check for frontend
                            docker ps | findstr test-frontend >nul 2>&1
                            if not errorlevel 1 (
                                echo Frontend container is running
                                docker stop test-frontend 2>nul || echo Container already stopped
                            ) else (
                                echo Frontend container failed to start
                                docker logs test-frontend 2>nul || echo No logs available
                                docker stop test-frontend 2>nul || echo Container already stopped
                                exit /b 1
                            )
                            
                            echo All Docker images tested successfully
                        """
                    }
                }
            }
        }
        
        stage('Push to Docker Hub') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                    branch 'develop'
                    expression { params.FORCE_DEPLOY == true }
                }
            }
            steps {
                script {
                    echo "Pushing images to Docker Hub..."
                    if (isUnix()) {
                        sh """
                            # Login to Docker Hub
                            echo ${DOCKERHUB_CREDENTIALS_PSW} | docker login -u ${DOCKERHUB_CREDENTIALS_USR} --password-stdin
                            
                            # Push backend images
                            echo "Pushing backend images..."
                            docker push ${DOCKERHUB_CREDENTIALS_USR}/${IMAGE_NAME_BACKEND}:${env.IMAGE_TAG}
                            docker push ${DOCKERHUB_CREDENTIALS_USR}/${IMAGE_NAME_BACKEND}:${env.ADDITIONAL_TAG}
                            
                            # Push frontend images
                            echo "Pushing frontend images..."
                            docker push ${DOCKERHUB_CREDENTIALS_USR}/${IMAGE_NAME_FRONTEND}:${env.IMAGE_TAG}
                            docker push ${DOCKERHUB_CREDENTIALS_USR}/${IMAGE_NAME_FRONTEND}:${env.ADDITIONAL_TAG}
                            
                            echo "All images pushed successfully to Docker Hub"
                            echo "Backend: ${DOCKERHUB_CREDENTIALS_USR}/${IMAGE_NAME_BACKEND}:${env.IMAGE_TAG}"
                            echo "Frontend: ${DOCKERHUB_CREDENTIALS_USR}/${IMAGE_NAME_FRONTEND}:${env.IMAGE_TAG}"
                        """
                    } else {
                        bat """
                            @echo off
                            REM Login to Docker Hub
                            echo %DOCKERHUB_CREDENTIALS_PSW% | docker login -u %DOCKERHUB_CREDENTIALS_USR% --password-stdin
                            
                            REM Push backend images
                            echo Pushing backend images...
                            docker push ${DOCKERHUB_CREDENTIALS_USR}/${IMAGE_NAME_BACKEND}:${env.IMAGE_TAG}
                            docker push ${DOCKERHUB_CREDENTIALS_USR}/${IMAGE_NAME_BACKEND}:${env.ADDITIONAL_TAG}
                            
                            REM Push frontend images
                            echo Pushing frontend images...
                            docker push ${DOCKERHUB_CREDENTIALS_USR}/${IMAGE_NAME_FRONTEND}:${env.IMAGE_TAG}
                            docker push ${DOCKERHUB_CREDENTIALS_USR}/${IMAGE_NAME_FRONTEND}:${env.ADDITIONAL_TAG}
                            
                            echo All images pushed successfully to Docker Hub
                            echo Backend: ${DOCKERHUB_CREDENTIALS_USR}/${IMAGE_NAME_BACKEND}:${env.IMAGE_TAG}
                            echo Frontend: ${DOCKERHUB_CREDENTIALS_USR}/${IMAGE_NAME_FRONTEND}:${env.IMAGE_TAG}
                        """
                    }
                }
            }
        }
    }
    
    post {
        always {
            script {
                echo "🧹 Cleaning up workspace..."
                // Clean up test containers
                if (isUnix()) {
                    sh '''
                        # Stop and remove any test containers
                        docker stop test-backend test-frontend 2>/dev/null || true
                        docker rm test-backend test-frontend 2>/dev/null || true
                        
                        # Clean up dangling images
                        docker image prune -f
                    '''
                } else {
                    bat '''
                        @echo off
                        REM Stop and remove any test containers
                        docker stop test-backend test-frontend 2>nul || echo Containers already stopped
                        docker rm test-backend test-frontend 2>nul || echo Containers already removed
                        
                        REM Clean up dangling images
                        docker image prune -f
                    '''
                }
                
                // Archive build artifacts if any
                archiveArtifacts artifacts: '**/package.json, **/Dockerfile', allowEmptyArchive: true
            }
        }
        
        success {
            script {
                echo "Pipeline completed successfully!"
                echo "Images available:"
                echo "Backend: ${DOCKERHUB_CREDENTIALS_USR}/${IMAGE_NAME_BACKEND}:${env.IMAGE_TAG}"
                echo "Frontend: ${DOCKERHUB_CREDENTIALS_USR}/${IMAGE_NAME_FRONTEND}:${env.IMAGE_TAG}"
                
                // Send success notification (configure your notification method)
                // slackSend(channel: '#deployments', color: 'good', message: "Songify deployment successful - Build #${env.BUILD_NUMBER}")
            }
        }
        
        failure {
            script {
                echo "Pipeline failed!"
                echo "Build logs available at: ${env.BUILD_URL}"
                
                // Send failure notification
                // slackSend(channel: '#deployments', color: 'danger', message: "Songify deployment failed - Build #${env.BUILD_NUMBER} - ${env.BUILD_URL}")
            }
        }
        
        unstable {
            script {
                echo "Pipeline completed with warnings"
                // slackSend(channel: '#deployments', color: 'warning', message: "Songify deployment unstable - Build #${env.BUILD_NUMBER}")
            }
        }
        
        cleanup {
            script {
                // Logout from Docker Hub
                if (isUnix()) {
                    sh 'docker logout || true'
                } else {
                    bat 'docker logout || echo Already logged out'
                }
                
                // Final cleanup
                cleanWs(
                    cleanWhenAborted: true,
                    cleanWhenFailure: true,
                    cleanWhenNotBuilt: true,
                    cleanWhenSuccess: true,
                    cleanWhenUnstable: true,
                    deleteDirs: true
                )
            }
        }
    }
    
    // Pipeline parameters (optional)
    parameters {
        booleanParam(
            name: 'FORCE_DEPLOY',
            defaultValue: false,
            description: 'Force deployment even from feature branches'
        )
        choice(
            name: 'LOG_LEVEL',
            choices: ['INFO', 'DEBUG', 'WARN', 'ERROR'],
            description: 'Set logging level for this build'
        )
    }
}
