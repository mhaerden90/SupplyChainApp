// This script is designed to test the solidity smart contract - SuppyChain.sol -- and the various functions within
// Declare a variable and assign the compiled smart contract artifact
var SupplyChain = artifacts.require('SupplyChain')

contract('SupplyChain', function(accounts) {
    // Declare few constants and assign a few sample accounts generated by ganache-cli
    var sku = 1
    var upc = 1
    const ownerID = accounts[0]
    const originFarmerID = accounts[1]
    const originFarmName = "John Doe"
    const originFarmInformation = "Yarray Valley"
    const originFarmLatitude = "-38.239770"
    const originFarmLongitude = "144.341490"
    var productID = sku + upc
    const productNotes = "Best beans for Espresso"
    const productPrice = web3.utils.toWei('1', "ether");
    var itemState = 0
    const distributorID = accounts[2]
    const retailerID = accounts[3]
    const consumerID = accounts[4]
    const emptyAddress = '0x00000000000000000000000000000000000000'


    console.log("ganache-cli accounts used here...")
    console.log("Contract Owner: accounts[0] ", accounts[0])
    console.log("Farmer: accounts[1] ", accounts[1])
    console.log("Distributor: accounts[2] ", accounts[2])
    console.log("Retailer: accounts[3] ", accounts[3])
    console.log("Consumer: accounts[4] ", accounts[4])

    // 1st Test
    it("Testing smart contract function harvestItem() that allows a farmer to harvest coffee", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Mark an item as Harvested by calling function harvestItem()
        tx = await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes);
        //get event name from logs
        let event = tx.logs[0].event;
        // const setFarmer = await supplyChain.addFarmer.call(originFarmerID)
        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], originFarmerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferOne[3], originFarmerID, 'Error: Missing or Invalid originFarmerID')
        assert.equal(resultBufferOne[4], originFarmName, 'Error: Missing or Invalid originFarmName')
        assert.equal(resultBufferOne[5], originFarmInformation, 'Error: Missing or Invalid originFarmInformation')
        assert.equal(resultBufferOne[6], originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude')
        assert.equal(resultBufferOne[7], originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude')
        assert.equal(resultBufferTwo[5], 0, 'Error: Invalid item State')
        assert.equal(event, 'Harvested', 'Invalid event emitted') 
        
        //add 1 to upc and sku because new item was harvested
        upc = upc+1;
        sku = sku+1
    })    


    
    // 2nd Test
    it("Testing smart contract function processItem() that allows a farmer to process coffee", async() => {
        
        const supplyChain = await SupplyChain.deployed()
        //Harvest
        await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes);
        //Process
        tx = await supplyChain.processItem(upc);
        //get event name from logs
        let event = tx.logs[0].event;

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferTwo[5], 1, 'Error: Invalid item State')
        assert.equal(event, 'Processed', 'Invalid event emitted')

    //add 1 to upc and sku because new item was harvested
    upc = upc+1;
    sku = sku+1
    })    

    // 3rd Test
    it("Testing smart contract function packItem() that allows a farmer to pack coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        //Harvest
        await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes);
        //Process
        await supplyChain.processItem(upc);
        //package    
        tx = await supplyChain.packItem(upc);
        //get event name from logs
        let event = tx.logs[0].event;

        

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferTwo[5], 2, 'Error: Invalid item State')
        assert.equal(event, 'Packed', 'Invalid event emitted')

        //add 1 to upc and sku because new item was harvested (the same happens in smart contract)
        upc = upc+1;
        sku = sku+1
    })    

    // 4th Test
    it("Testing smart contract function sellItem() that allows a farmer to sell coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        //Harvest
        await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes);
        //Process
        await supplyChain.processItem(upc);
        //package    
        await supplyChain.packItem(upc);
        //put up for sale
        tx = await supplyChain.sellItem(upc, productPrice);
        
        //get event name from logs
        let event = tx.logs[0].event;

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferTwo[4], productPrice, 'Error: Invalid product price')
        assert.equal(resultBufferTwo[5], 3, 'Error: Invalid item State')
        assert.equal(event, 'ForSale', 'Invalid event emitted')

        //add 1 to upc and sku because new item was harvested (the same happens in smart contract)
        upc = upc+1;
        sku = sku+1
    })    

    // 5th Test
    it("Testing smart contract function buyItem() that allows a distributor to buy coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        //Harvest
        await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes);
        //Process
        await supplyChain.processItem(upc);
        //package    
        await supplyChain.packItem(upc);
        //put up for sale
        await supplyChain.sellItem(upc, productPrice);
        //add grant our distributor access to function
        await supplyChain.addDistributor(distributorID);
        //buy
        tx = await supplyChain.buyItem(upc, {from: distributorID , value: productPrice});

        //get event name from logs
        let event = tx.logs[0].event;     
               

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferTwo[5], 4, 'Error: Invalid item State')
        assert.equal(event, 'Sold', 'Invalid event emitted')

        //add 1 to upc and sku because new item was harvested (the same happens in smart contract)
        upc = upc+1;
        sku = sku+1

    })    

    // 6th Test
    it("Testing smart contract function shipItem() that allows a distributor to ship coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        //Harvest
        await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes);
        //Process
        await supplyChain.processItem(upc);
        //package    
        await supplyChain.packItem(upc);
        //put up for sale
        await supplyChain.sellItem(upc, productPrice);
        //buy
        await supplyChain.buyItem(upc, {from: distributorID , value: productPrice});
        //ship
        tx = await supplyChain.shipItem(upc, {from: distributorID});
        //get event name from logs
        let event = tx.logs[0].event;     
               

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferTwo[5], 5, 'Error: Invalid item State')
        assert.equal(event, 'Shipped', 'Invalid event emitted')
        
        //add 1 to upc and sku because new item was harvested (the same happens in smart contract)
        upc = upc+1;
        sku = sku+1              
    })    

    // 7th Test
    it("Testing smart contract function receiveItem() that allows a retailer to mark coffee received", async() => {
        const supplyChain = await SupplyChain.deployed()
        //Harvest
        await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes);
        //Process
        await supplyChain.processItem(upc);
        //package    
        await supplyChain.packItem(upc);
        //put up for sale
        await supplyChain.sellItem(upc, productPrice);
        //buy
        await supplyChain.buyItem(upc, {from: distributorID , value: productPrice});
        //ship
        await supplyChain.shipItem(upc , {from: distributorID});
        //add Retailer
        await supplyChain.addRetailer(retailerID);
        //received
        tx = await supplyChain.receiveItem(upc, {from: retailerID});
        
        //get event name from logs
        let event = tx.logs[0].event;     
               

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferTwo[5], 6, 'Error: Invalid item State')
        assert.equal(event, 'Received', 'Invalid event emitted')
       
        //add 1 to upc and sku because new item was harvested (the same happens in smart contract)
        upc = upc+1;
        sku = sku+1             
    })    

    // 8th Test
    it("Testing smart contract function purchaseItem() that allows a consumer to purchase coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        //Harvest
        await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes);
        //Process
        await supplyChain.processItem(upc);
        //package    
        await supplyChain.packItem(upc);
        //put up for sale
        await supplyChain.sellItem(upc, productPrice);
        //buy
        await supplyChain.buyItem(upc, {from: distributorID , value: productPrice});
        //ship
        await supplyChain.shipItem(upc, {from: distributorID});
        //received
        await supplyChain.receiveItem(upc, {from: retailerID});
        //add consumer
        await supplyChain.addConsumer(consumerID);
        // purchase
        tx = await supplyChain.purchaseItem(upc, {from: consumerID});
        //get event name from logs
        let event = tx.logs[0].event;

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc);

        // Verify the result set
        assert.equal(resultBufferOne[2], consumerID, 'Error: Invalid OwnerID')
        assert.equal(resultBufferTwo[8], consumerID, 'Error: Invalid ConsumerID')
        assert.equal(resultBufferTwo[5], 7, 'Error: Invalid item State')
        assert.equal(event, 'Purchased', 'Invalid event emitted')     
    })    

    // 9th Test
    it("Testing smart contract function fetchItemBufferOne() that allows anyone to fetch item details from blockchain", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc);

        // Verify the result set:
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU') 
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], consumerID, 'Error: Missing or Invalid ownerID') // owner is consumer 
        assert.equal(resultBufferOne[3], originFarmerID, 'Error: Missing or Invalid originFarmerID')
        assert.equal(resultBufferOne[4], originFarmName, 'Error: Missing or Invalid originFarmName')
        assert.equal(resultBufferOne[5], originFarmInformation, 'Error: Missing or Invalid originFarmInformation')
        assert.equal(resultBufferOne[6], originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude')
        assert.equal(resultBufferOne[7], originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude')
        
    })

    // 10th Test
    it("Testing smart contract function fetchItemBufferTwo() that allows anyone to fetch item details from blockchain", async() => {
        const supplyChain = await SupplyChain.deployed()
        
        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);
        
            // Verify the result set:
        assert.equal(resultBufferTwo[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferTwo[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferTwo[2], sku+upc, 'Error: Missing or Invalid productID') //product id should equal to sku + upc
        assert.equal(resultBufferTwo[3], productNotes, 'Error: Missing or Invalid productNotes')
        assert.equal(resultBufferTwo[4], productPrice, 'Error: Missing or Invalid productPrice')
        assert.equal(resultBufferTwo[5], 7, 'Error: Missing or Invalid item State') // item.state of last created product (owned by consumer)
        assert.equal(resultBufferTwo[6], distributorID, 'Error: Invalid Distributor ID')
        assert.equal(resultBufferTwo[7], retailerID, 'Error: Invalid item RetailerID')
        assert.equal(resultBufferTwo[8], consumerID, 'Error: Invalid item ConsumerID')
        
    })

});

