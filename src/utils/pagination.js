//This Function Takes Page,Size And Its Def Values page-->1 , size--->2
export const PaginationFuction=({ page=1,size=2})=>{
    if(page<1) page=1
    if(size<1) size=2

    const limit=size
    const skip_pg=(page-1)*size

    return{limit,skip_pg}
}