#!/usr/bin/env pwsh
# PowerShell script to test Trackeneer AI agents via API

# Wait for server to start
Write-Host "🤖 Testing Trackeneer Agentic AI System..." -ForegroundColor Cyan
Write-Host "Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

$baseUrl = "http://localhost:3000/api/ai"

# Test Study Plan Agent
Write-Host "`n📚 Testing Study Plan Agent..." -ForegroundColor Green
$studyPlanBody = @{
    subject = "Computer Science"
    topic = "Data Structures"
    duration = "semester"
    level = "intermediate"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/study-plan" -Method POST -Body $studyPlanBody -ContentType "application/json"
    Write-Host "✅ Study Plan Response:" -ForegroundColor Green
    Write-Host $response.data.Substring(0, [Math]::Min(200, $response.data.Length)) + "..." -ForegroundColor White
} catch {
    Write-Host "❌ Error (might need authentication): $($_.Exception.Message)" -ForegroundColor Red
}

# Test Assignment Help Agent
Write-Host "`n📝 Testing Assignment Help Agent..." -ForegroundColor Green
$assignmentBody = @{
    subject = "Algorithms"
    assignment = "Binary Search Implementation"
    question = "How do I implement binary search recursively?"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/assignment-help" -Method POST -Body $assignmentBody -ContentType "application/json"
    Write-Host "✅ Assignment Help Response:" -ForegroundColor Green
    Write-Host $response.data.Substring(0, [Math]::Min(200, $response.data.Length)) + "..." -ForegroundColor White
} catch {
    Write-Host "❌ Error (might need authentication): $($_.Exception.Message)" -ForegroundColor Red
}

# Test Career Advice Agent
Write-Host "`n💼 Testing Career Advice Agent..." -ForegroundColor Green
$careerBody = @{
    interests = "Machine Learning, Web Development"
    skills = "Python, JavaScript, React"
    currentYear = "3rd year"
    cgpa = "3.5"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/career-advice" -Method POST -Body $careerBody -ContentType "application/json"
    Write-Host "✅ Career Advice Response:" -ForegroundColor Green
    Write-Host $response.data.Substring(0, [Math]::Min(200, $response.data.Length)) + "..." -ForegroundColor White
} catch {
    Write-Host "❌ Error (might need authentication): $($_.Exception.Message)" -ForegroundColor Red
}

# Test General Q&A Agent
Write-Host "`n❓ Testing General Q&A Agent..." -ForegroundColor Green
$questionBody = @{
    question = "What are the best programming languages to learn in 2025?"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/ask" -Method POST -Body $questionBody -ContentType "application/json"
    Write-Host "✅ General Q&A Response:" -ForegroundColor Green
    Write-Host $response.data.Substring(0, [Math]::Min(200, $response.data.Length)) + "..." -ForegroundColor White
} catch {
    Write-Host "❌ Error (might need authentication): $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 AI Agent Testing Complete!" -ForegroundColor Cyan
Write-Host "💡 Note: Authentication errors are normal - use the web interface for full functionality" -ForegroundColor Yellow
