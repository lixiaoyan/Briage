Briage().add(function(B){
    B.namespace("B.JSON");
    if(window.JSON && JSON.parse){
        B.JSON.parse=JSON.parse;
    }else{
        B.JSON.parse=function(string){
            //FIXME: Filter the string
            return eval("("+string+")");
        };
    }
},"json",[]);