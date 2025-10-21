# Healthcare API - Complete CRUD Test Script
Write-Host "`n╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   HEALTHCARE API - CRUD TEST              ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Cyan

# Colors
$success = "Green"
$error = "Red"
$info = "Yellow"

# Test Results
$results = @{
    passed = 0
    failed = 0
}

function Test-Endpoint {
    param($name, $method, $url, $headers, $body)
    try {
        $params = @{
            Uri = $url
            Method = $method
            Headers = $headers
            ErrorAction = 'Stop'
        }
        if ($body) {
            $params['Body'] = $body
            $params['ContentType'] = 'application/json'
        }
        $response = Invoke-RestMethod @params
        Write-Host "   ✅ $name" -ForegroundColor $success
        $script:results.passed++
        return $response
    } catch {
        Write-Host "   ❌ $name - $($_.Exception.Message)" -ForegroundColor $error
        $script:results.failed++
        return $null
    }
}

# Step 1: Authentication
Write-Host "`n1️⃣  AUTHENTICATION" -ForegroundColor $info
$loginBody = @{email="madudamian25@gmail.com";password="password123"} | ConvertTo-Json
$loginResp = Test-Endpoint "Login" "POST" "http://localhost:5001/api/auth/login" @{} $loginBody

if (-not $loginResp) {
    Write-Host "`n❌ Authentication failed. Cannot proceed with tests." -ForegroundColor $error
    exit
}

$token = $loginResp.token
$authHeaders = @{
    Authorization = "Bearer $token"
    'Content-Type' = 'application/json'
}

# Step 2: Vitals CRUD
Write-Host "`n2️⃣  VITALS CRUD" -ForegroundColor $info
$vitalBody = @{type="Blood Pressure";value="120/80";unit="mmHg";notes="Morning reading"} | ConvertTo-Json
$createdVital = Test-Endpoint "Create Vital" "POST" "http://localhost:5001/api/vitals" $authHeaders $vitalBody
$vitals = Test-Endpoint "Get All Vitals" "GET" "http://localhost:5001/api/vitals" $authHeaders

if ($createdVital) {
    $vitalId = $createdVital.vital._id
    Test-Endpoint "Get Single Vital" "GET" "http://localhost:5001/api/vitals/$vitalId" $authHeaders
    $updateBody = @{type="Blood Pressure";value="118/78";unit="mmHg";notes="Evening reading"} | ConvertTo-Json
    Test-Endpoint "Update Vital" "PUT" "http://localhost:5001/api/vitals/$vitalId" $authHeaders $updateBody
    Test-Endpoint "Delete Vital" "DELETE" "http://localhost:5001/api/vitals/$vitalId" $authHeaders
}

# Step 3: Medications CRUD
Write-Host "`n3️⃣  MEDICATIONS CRUD" -ForegroundColor $info
$medBody = @{name="Aspirin";dosage="100mg";frequency="Once daily";notes="Take with food"} | ConvertTo-Json
$createdMed = Test-Endpoint "Create Medication" "POST" "http://localhost:5001/api/medications" $authHeaders $medBody
$meds = Test-Endpoint "Get All Medications" "GET" "http://localhost:5001/api/medications" $authHeaders

if ($createdMed) {
    $medId = $createdMed.medication._id
    Test-Endpoint "Get Single Medication" "GET" "http://localhost:5001/api/medications/$medId" $authHeaders
    $updateMedBody = @{name="Aspirin";dosage="100mg";frequency="Twice daily";notes="Updated dosage"} | ConvertTo-Json
    Test-Endpoint "Update Medication" "PUT" "http://localhost:5001/api/medications/$medId" $authHeaders $updateMedBody
    Test-Endpoint "Delete Medication" "DELETE" "http://localhost:5001/api/medications/$medId" $authHeaders
}

# Step 4: Appointments CRUD
Write-Host "`n4️⃣  APPOINTMENTS CRUD" -ForegroundColor $info
$apptBody = @{title="Annual Checkup";doctorName="Dr. Smith";date="2025-11-01";time="10:00";type="Checkup";status="scheduled"} | ConvertTo-Json
$createdAppt = Test-Endpoint "Create Appointment" "POST" "http://localhost:5001/api/appointments" $authHeaders $apptBody
$appts = Test-Endpoint "Get All Appointments" "GET" "http://localhost:5001/api/appointments" $authHeaders

if ($createdAppt) {
    $apptId = $createdAppt.appointment._id
    Test-Endpoint "Get Single Appointment" "GET" "http://localhost:5001/api/appointments/$apptId" $authHeaders
    $updateApptBody = @{title="Annual Checkup";doctorName="Dr. Smith";date="2025-11-01";time="11:00";type="Checkup";status="confirmed"} | ConvertTo-Json
    Test-Endpoint "Update Appointment" "PUT" "http://localhost:5001/api/appointments/$apptId" $authHeaders $updateApptBody
    Test-Endpoint "Delete Appointment" "DELETE" "http://localhost:5001/api/appointments/$apptId" $authHeaders
}

# Step 5: Devices CRUD
Write-Host "`n5️⃣  DEVICES CRUD" -ForegroundColor $info
$deviceBody = @{name="Fitbit";type="fitness_tracker";model="Charge 5";manufacturer="Fitbit";status="connected"} | ConvertTo-Json
$createdDevice = Test-Endpoint "Create Device" "POST" "http://localhost:5001/api/devices" $authHeaders $deviceBody
$devices = Test-Endpoint "Get All Devices" "GET" "http://localhost:5001/api/devices" $authHeaders

if ($createdDevice) {
    $deviceId = $createdDevice.device._id
    Test-Endpoint "Get Single Device" "GET" "http://localhost:5001/api/devices/$deviceId" $authHeaders
    $updateDeviceBody = @{name="Fitbit Charge 5";type="fitness_tracker";model="Charge 5";manufacturer="Fitbit";status="active"} | ConvertTo-Json
    Test-Endpoint "Update Device" "PUT" "http://localhost:5001/api/devices/$deviceId" $authHeaders $updateDeviceBody
    Test-Endpoint "Delete Device" "DELETE" "http://localhost:5001/api/devices/$deviceId" $authHeaders
}

# Summary
Write-Host "`n╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         TEST SUMMARY                      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host "`n✅ Passed: $($results.passed)" -ForegroundColor $success
Write-Host "❌ Failed: $($results.failed)" -ForegroundColor $error

$total = $results.passed + $results.failed
$percentage = [math]::Round(($results.passed / $total) * 100, 2)
Write-Host "`nSuccess Rate: $percentage%" -ForegroundColor $(if ($percentage -gt 90) { $success } else { $error })

Write-Host "`n"

