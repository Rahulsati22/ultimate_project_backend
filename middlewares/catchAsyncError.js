export const catchAsyncError = (passedFunction)=>(request,response, next)=>{
    Promise.resolve(passedFunction(request,response,next)).catch(next)
}