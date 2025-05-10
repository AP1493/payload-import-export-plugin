
export const extractAllKeys = (obj: any): { isObject: boolean; key: string; level: number; path: string }[] => {
    const result: { isObject: boolean; key: string; level: number; path: string }[] = []
  
    const extract = (obj: any, prefix = "", level = 0) => {
      if (!obj || typeof obj !== "object" || Array.isArray(obj)) {return}
  
      Object.keys(obj).forEach((key) => {
        // Skip internal fields like _id, __v, etc.
        if (key.startsWith("_") && key !== "id") {return}
  
        const path = prefix ? `${prefix}.${key}` : key
        const value = obj[key]
        const isObject = value && typeof value === "object" && !Array.isArray(value)
  
        result.push({ isObject, key, level, path })
  
        if (isObject) {
          extract(value, path, level + 1)
        }
      })
    }
  
    extract(obj)
    return result
  }

  export const flattenObject = (obj: any): Record<string, any> => {
    const result: Record<string, any> = {}
  
    const flatten = (obj: any, prefix = "") => {
      if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
        result[prefix] = obj
        return
      }
  
      Object.keys(obj).forEach((key) => {
        const path = prefix ? `${prefix}.${key}` : key
        const value = obj[key]
  
        if (value && typeof value === "object" && !Array.isArray(value)) {
          flatten(value, path)
        } else {
          result[path] = value
        }
      })
    }
  
    flatten(obj)
    return result
  }
  
  export const filterObjectByFields = (obj: any, fields: string[]): Record<string, any> => {
    const flattened = flattenObject(obj)
    const result: Record<string, any> = {}
  
    fields.forEach((field) => {
      if (field in flattened) {
        result[field] = flattened[field]
      }
    })
  
    return result
  }
  
  export const unflattenObject = (obj: Record<string, any>): any => {
    const result: any = {}
  
    Object.keys(obj).forEach((key) => {
      const parts = key.split(".")
      let current = result
  
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i]
        if (!(part in current)) {
          current[part] = {}
        }
        current = current[part]
      }
  
      current[parts[parts.length - 1]] = obj[key]
    })
  
    return result
  }
  