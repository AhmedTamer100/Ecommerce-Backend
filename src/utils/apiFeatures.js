import { PaginationFuction } from "./pagination.js"


export class ForApiFeatures{
    constructor(MongQuery,QueryData){
        this.MongQuery=MongQuery
        this.QueryData=QueryData
    }

//Pagination
pagination(){
    const{page,size}=this.QueryData
    const{limit,skip}=PaginationFuction({page,size})  //calculating
    this.MongQuery.limit(limit).skip(skip)
    return this
}

//Sorting
Sort(){
    this.MongQuery.sort(this.QueryData.sort?.replaceAll(',',''))
    return this
}

//Select
Select(){
    this.MongQuery.Select(this.QueryData.select?.replaceAll(',',''))
    return this
}

//Filters
Filters(){
const Query={...this.QueryData}  //Coping QueryData Objects
const AllowedKeysArr=['page','size','sort','select','search']
AllowedKeysArr.forEach((key)=> delete Query[key])
const QueryString=JSON.parse(
    JSON.stringify(Query).replace(
    /gt|gte|lt|lte|in|nin|eq|neq|regex/g,
    (match)=>`$${match}`
    ),
)
this.MongQuery,find(QueryString)
return this
}

//Skip fields
skipFields(fields){
    this.MongQuery.select(fields.split(',').map(field => `-${field}`).join(' '))
    return this
}

//Count
count(){
    return this.MongQuery.countDocuments()  //RETURN No of Matched Queries
}

 //Product Reviews
 productReviews(){
    this.MongQuery.populate('reviews')
    return this
}
}

