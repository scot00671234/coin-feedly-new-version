// Simple test script to verify pricing accuracy improvements
// Run with: node test-pricing-accuracy.js

const testPricingAccuracy = async () => {
  console.log('🧪 Testing Pricing Accuracy Improvements...\n')
  
  const baseUrl = 'http://localhost:3000'
  
  try {
    // Test 1: Ticker prices with cache busting
    console.log('1. Testing ticker prices with cache busting...')
    const tickerResponse = await fetch(`${baseUrl}/api/crypto-prices?t=${Date.now()}`)
    const tickerData = await tickerResponse.json()
    
    if (tickerData && tickerData.length > 0) {
      console.log(`✅ Ticker: Found ${tickerData.length} cryptocurrencies`)
      console.log(`   Latest BTC price: $${tickerData[0]?.current_price || 'N/A'}`)
      console.log(`   Cache status: ${tickerResponse.headers.get('X-Cache-Status')}`)
    } else {
      console.log('❌ Ticker: No data received')
    }
    
    // Test 2: Charts API with cache busting
    console.log('\n2. Testing charts API with cache busting...')
    const chartsResponse = await fetch(`${baseUrl}/api/crypto?action=list&page=1&perPage=10&t=${Date.now()}`)
    const chartsData = await chartsResponse.json()
    
    if (chartsData && chartsData.length > 0) {
      console.log(`✅ Charts: Found ${chartsData.length} cryptocurrencies`)
      console.log(`   Latest BTC price: $${chartsData[0]?.current_price || 'N/A'}`)
      console.log(`   Cache status: ${chartsResponse.headers.get('X-Cache-Status')}`)
    } else {
      console.log('❌ Charts: No data received')
    }
    
    // Test 3: Compare prices between ticker and charts
    console.log('\n3. Comparing prices between ticker and charts...')
    if (tickerData && chartsData && tickerData.length > 0 && chartsData.length > 0) {
      const tickerBtc = tickerData[0]
      const chartsBtc = chartsData[0]
      
      if (tickerBtc && chartsBtc) {
        const priceDiff = Math.abs(tickerBtc.current_price - chartsBtc.current_price)
        const priceDiffPercent = (priceDiff / tickerBtc.current_price) * 100
        
        console.log(`   Ticker BTC price: $${tickerBtc.current_price}`)
        console.log(`   Charts BTC price: $${chartsBtc.current_price}`)
        console.log(`   Price difference: $${priceDiff.toFixed(2)} (${priceDiffPercent.toFixed(4)}%)`)
        
        if (priceDiffPercent < 0.1) {
          console.log('✅ Prices are consistent between ticker and charts')
        } else {
          console.log('⚠️  Prices differ between ticker and charts')
        }
      }
    }
    
    // Test 4: Cache performance
    console.log('\n4. Testing cache performance...')
    const startTime = Date.now()
    const cachedResponse = await fetch(`${baseUrl}/api/crypto-prices`)
    const endTime = Date.now()
    const responseTime = endTime - startTime
    
    console.log(`   Response time: ${responseTime}ms`)
    console.log(`   Cache status: ${cachedResponse.headers.get('X-Cache-Status')}`)
    
    if (responseTime < 100) {
      console.log('✅ Fast response time (likely cached)')
    } else {
      console.log('⚠️  Slow response time (likely fresh API call)')
    }
    
    console.log('\n🎉 Pricing accuracy test completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.log('\n💡 Make sure the development server is running on localhost:3000')
  }
}

// Run the test
testPricingAccuracy()
