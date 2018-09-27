const {LicenseSchema} = require('../schema/client_schema')
const mongo = require('../helpers/mongo_querys');

//by default will license expiry will be set to exact 1month of the creation. 
const no_months =1 ;
function randomString(length) {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"; 
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

const generateNewLisence = async (client_ObjectId,license_expiry_month)=>{
    let license_expiry = new Date(new Date().setMonth(new Date().getMonth()+(license_expiry_month ? license_expiry_month : no_months))); 
    
    let find_query={_id:client_ObjectId};
    const index_B = Number(Date.now().toString().split("").splice(11,10).join(""))+1 ;
    const index_A = Number(Date.now().toString().split("").splice(8,13).join(""))+index_B;
    const index_C = Date.now().toString().split("").splice(10,10).join("");
    const index_D = randomString(4);
    const license_key= index_A+'-'+index_B+'-'+index_C+'-'+index_D ;
    let update_query = {
        license_details:{
            license_key: license_key,
            license_created: new Date(),
            license_expiry:license_expiry 
        }
    };
let license_update;

try{
    console.log(update_query)
license_update = await mongo.updateCollection('clients',find_query,{$set:update_query});
}catch(error_in_catch){
    return error_in_catch
}
return {license_generated:license_update,...update_query.license_details};
};

module.exports ={
    generateNewLisence
}