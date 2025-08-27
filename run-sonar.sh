#!/bin/bash

echo "======================================"
echo "Running SonarCloud Analysis Locally"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if sonar-scanner is installed
if ! command -v sonar-scanner &> /dev/null; then
    echo -e "${RED}sonar-scanner is not installed!${NC}"
    echo "Please install it first:"
    echo "  - Download from: https://docs.sonarcloud.io/advanced-setup/ci-based-analysis/sonarscanner-cli/"
    echo "  - Or use: brew install sonar-scanner (on macOS)"
    echo "  - Or use: choco install sonarqube-scanner (on Windows with Chocolatey)"
    exit 1
fi

# Check for SONAR_TOKEN
if [ -z "$SONAR_TOKEN" ]; then
    echo -e "${YELLOW}Warning: SONAR_TOKEN environment variable is not set${NC}"
    echo "You need to set your SonarCloud token:"
    echo "  export SONAR_TOKEN=your_token_here"
    echo ""
    echo "Get your token from: https://sonarcloud.io/account/security"
    exit 1
fi

# Run backend tests with coverage
echo -e "${GREEN}Running backend tests with coverage...${NC}"
cd backend
npm run test:cov
cd ..

# Run frontend tests with coverage
echo -e "${GREEN}Running frontend tests with coverage...${NC}"
cd frontend
npm test -- --watchAll=false --coverage
cd ..

# Run SonarCloud analysis
echo -e "${GREEN}Running SonarCloud analysis...${NC}"
sonar-scanner \
  -Dsonar.token=$SONAR_TOKEN \
  -Dsonar.host.url=https://sonarcloud.io

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ SonarCloud analysis completed successfully!${NC}"
    echo "View results at: https://sonarcloud.io/dashboard?id=EnolCode_Memory"
else
    echo -e "${RED}✗ SonarCloud analysis failed!${NC}"
    exit 1
fi