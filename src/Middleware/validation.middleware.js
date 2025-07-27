



export const validationMiddleware = (schema) => {
    return async (req, res, next) => {
        const schemaKeys = Object.keys(schema)

        const Errors = []
        for(const key of schemaKeys){
            const validationResult = schema[key].validate(req[key], {abortEarly: false}).error
            
            if(validationResult){
                Errors.push(...validationResult.details)
            }
        }
        if(Errors.length){
            return res.status(400).json({message: 'Validation error', error: Errors})
        }
        next()
    }
}


