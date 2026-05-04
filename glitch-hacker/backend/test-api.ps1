# Test API Endpoints for The Glitch Hacker Backend

$baseUrl = "http://localhost:3002"

Write-Host "========================================"
Write-Host "Testing The Glitch Hacker API"
Write-Host "========================================"

# Test 1: Health Check
Write-Host "`n1. Testing Health Check..."
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/health" -Method GET
    Write-Host "   Status: $($response.status)" -ForegroundColor Green
    Write-Host "   Version: $($response.version)"
} catch {
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Get Leaderboard (public endpoint)
Write-Host "`n2. Testing Leaderboard..."
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/users/leaderboard" -Method GET
    Write-Host "   Users found: $($response.total)" -ForegroundColor Green
} catch {
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Shop Items (requires auth - should fail)
Write-Host "`n3. Testing Shop Items (no auth)..."
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/shop/items" -Method GET
    Write-Host "   Unexpected success" -ForegroundColor Yellow
} catch {
    $status = $_.Exception.Response.StatusCode.value__
    Write-Host "   Expected 401: $status" -ForegroundColor Green
}

# Test 4: Create Test User via Auth
Write-Host "`n4. Testing User Creation..."
$initData = @{
    initData = "user={`"id`":123456789,`"username`":`"test_hacker`",`"first_name`":`"Test`"}&auth_date=1706697600&hash=test123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/telegram" -Method POST -ContentType "application/json" -Body $initData
    Write-Host "   User created: $($response.user.username)" -ForegroundColor Green
    Write-Host "   Balance: $($response.user.bitz) $BITZ"
    Write-Host "   Energy: $($response.user.energy)/$($response.user.maxEnergy)"
    
    # Save token for further tests
    $script:authToken = $response.token
    $script:userId = $response.user.id
} catch {
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $errorBody = $reader.ReadToEnd()
        Write-Host "   Response: $errorBody" -ForegroundColor Red
    }
}

# Test 5: Get User Profile (with auth)
if ($script:authToken) {
    Write-Host "`n5. Testing User Profile..."
    $headers = @{
        "Authorization" = "Bearer $($script:authToken)"
    }
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/users/me" -Method GET -Headers $headers
        Write-Host "   User: $($response.user.firstName)" -ForegroundColor Green
        Write-Host "   Balance: $($response.user.bitz) $BITZ"
        Write-Host "   Click Power: $($response.user.clickPower)"
    } catch {
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 6: Get Clicker Status
if ($script:authToken) {
    Write-Host "`n6. Testing Clicker Status..."
    $headers = @{
        "Authorization" = "Bearer $($script:authToken)"
    }
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/clicker/status" -Method GET -Headers $headers
        Write-Host "   Energy: $($response.energy.current)/$($response.energy.max)" -ForegroundColor Green
        Write-Host "   Refill Rate: $($response.energy.refillRate)/sec"
        Write-Host "   Passive Income: $($response.passiveIncome.perSecond)/sec"
    } catch {
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 7: Click Action
if ($script:authToken) {
    Write-Host "`n7. Testing Click Action..."
    $headers = @{
        "Authorization" = "Bearer $($script:authToken)"
    }
    $body = @{
        timestamp = (Get-Date -Format "o")
        energyCost = 1
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/clicker/click" -Method POST -Headers $headers -ContentType "application/json" -Body $body
        Write-Host "   Earned: $($response.earned) $BITZ" -ForegroundColor Green
        Write-Host "   New Balance: $($response.newBalance)"
        Write-Host "   Energy Remaining: $($response.energyRemaining)"
    } catch {
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 8: Get Shop Items
if ($script:authToken) {
    Write-Host "`n8. Testing Shop Items..."
    $headers = @{
        "Authorization" = "Bearer $($script:authToken)"
    }
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/shop/items" -Method GET -Headers $headers
        Write-Host "   Items available: $($response.items.Count)" -ForegroundColor Green
        Write-Host "   Balance: $($response.balance) $BITZ"
        
        # Show first item
        if ($response.items.Count -gt 0) {
            $firstItem = $response.items[0]
            Write-Host "   First item: $($firstItem.name) - $($firstItem.currentPrice) $BITZ"
        }
    } catch {
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 9: PVP Cooldown
if ($script:authToken) {
    Write-Host "`n9. Testing PVP Cooldown..."
    $headers = @{
        "Authorization" = "Bearer $($script:authToken)"
    }
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/pvp/cooldown" -Method GET -Headers $headers
        Write-Host "   Can Hack: $($response.canHack)" -ForegroundColor Green
        Write-Host "   Cooldown: $($response.remainingSeconds)s"
    } catch {
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 10: PVP Stats
if ($script:authToken) {
    Write-Host "`n10. Testing PVP Stats..."
    $headers = @{
        "Authorization" = "Bearer $($script:authToken)"
    }
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/pvp/stats" -Method GET -Headers $headers
        Write-Host "   Hacks Attempted: $($response.hacksAttempted)" -ForegroundColor Green
        Write-Host "   Success Rate: $($response.successRate)%"
        Write-Host "   Net Profit: $($response.netProfit) $BITZ"
    } catch {
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n========================================"
Write-Host "API Testing Complete"
Write-Host "========================================"