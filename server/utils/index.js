module.exports.FormatData = (data,message) => {
        if(data){
                if (message) {
                        return { 
                                success : true,
                                data : data,
                                message : message
                             }  
                }else {
                        return { 
                                success : true,
                                data : data
                        }
             }
        }else{
            throw new Error('Data Not found!')
        }
    }
