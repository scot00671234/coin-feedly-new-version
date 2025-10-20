// Test script for real-time pricing
// Run with: node test-realtime-pricing.js

const testRealtimePricing = async () => {
  console.log('🚀 Testing Real-Time Pricing Implementation...\n')
  
  const baseUrl = 'http://localhost:3000'
  
  try {
    // Test 1: Real-time endpoint
    console.log('1. Testing real-time endpoint...')
    const realtimeResponse = await fetch(`${baseUrl}/api/crypto-realtime`)
    const realtimeData = await realtimeResponse.json()
    
    if (realtimeData && realtimeData.length > 0) {
      console.log(`✅ Real-time endpoint working: ${realtimeData.length} cryptocurrencies`)
      console.log(`   Cache status: ${realtimeResponse.headers.get('X-Cache-Status')}`)
      console.log(`   Data freshness: ${realtimeResponse.headers.get('X-Data-Freshness')}`)
      console.log(`   Latest BTC price: $${realtimeData[0]?.current_price || 'N/A'}`)
    } else {
      console.log('❌ Real-time endpoint failed')
    }
    
    // Test 2: Regular endpoint with cache busting
    console.log('\n2. Testing regular endpoint with cache busting...')
    const regularResponse = await fetch(`${baseUrl}/api/crypto-prices?t=${Date.now()}`)
    const regularData = await regularResponse.json()
    
    if (regularData && regularData.length > 0) {
      console.log(`✅ Regular endpoint with cache busting working: ${regularData.length} cryptocurrencies`)
      console.log(`   Cache status: ${regularResponse.headers.get('X-Cache-Status')}`)
      console.log(`   Latest BTC price: $${regularData[0]?.current_price || 'N/A'}`)
    } else {
      console.log('❌ Regular endpoint with cache busting failed')
    }
    
    // Test 3: Compare prices between endpoints
    console.log('\n3. Comparing prices between endpoints...')
    if (realtimeData && regularData && realtimeData.length > 0 && regularData.length > 0) {
      const realtimeBtc = realtimeData[0]
      const regularBtc = regularData[0]
      
      if (realtimeBtc && regularBtc) {
        const priceDiff = Math.abs(realtimeBtc.current_price - regularBtc.current_price)
        const priceDiffPercent = (priceDiff / realtimeBtc.current_price) * 100
        
        console.log(`   Real-time BTC price: $${realtimeBtc.current_price}`)
        console.log(`   Regular BTC price: $${regularBtc.current_price}`)
        console.log(`   Price difference: $${priceDiff.toFixed(2)} (${priceDiffPercent.toFixed(4)}%)`)
        
        if (priceDiffPercent < 0.01) {
          console.log('✅ Prices are consistent between endpoints')
        } else {
          console.log('⚠️  Prices differ between endpoints')
        }
      }
    }
    
    // Test 4: Performance test
    console.log('\n4. Testing performance...')
    const startTime = Date.now()
    const perfResponse = await fetch(`${baseUrl}/api/crypto-realtime`)
    const endTime = Date.now()
    const responseTime = endTime - startTime
    
    console.log(`   Response time: ${responseTime}ms`)
    console.log(`   Cache status: ${perfResponse.headers.get('X-Cache-Status')}`)
    
    if (responseTime < 2000) {
      console.log('✅ Good response time for real-time data')
    } else {
      console.log('⚠️  Slow response time - may need optimization')
    }
    
    // Test 5: Multiple rapid requests
    console.log('\n5. Testing multiple rapid requests...')
    const promises = []
    for (let i = 0; i < 5; i++) {
      promises.push(fetch(`${baseUrl}/api/crypto-realtime`))
    }
    
    const results = await Promise.all(promises)
    const allSuccessful = results.every(r => r.ok)
    
    if (allSuccessful) {
      console.log('✅ Multiple rapid requests handled successfully')
    } else {
      console.log('❌ Some rapid requests failed')
    }
    
    console.log('\n🎉 Real-time pricing test completed!')
    console.log('\n📊 Summary:')
    console.log('   - Real-time endpoint: /api/crypto-realtime')
    console.log('   - Ticker refresh: Every 5 seconds')
    console.log('   - Charts refresh: Every 10 seconds')
    console.log('   - Cache TTL: 30 seconds for ticker, 1 minute for lists')
    console.log('   - All caching bypassed for real-time data')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.log('\n💡 Make sure the development server is running on localhost:3000')
  }
}

// Run the test
testRealtimePricing()
