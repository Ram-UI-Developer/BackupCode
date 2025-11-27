import moment from 'moment'

export const handleKeyPress = (event, setFormErrors) => {
    const { name, value } = event.target
    const regex = /^[a-zA-Z0-9 .,!?-]*$/

    const isValid = (input) => {
        if (input.length === 0) {
            return true
        }
        return /^[a-zA-Z][a-zA-Z0-9 .,!?-]*$/.test(input)
    }

    // Handle keypress validation
    if (event.type === 'keypress') {
        const key = event.key

        // Prevent first character from being a number or space
        if (value.length === 0 && !/^[a-zA-Z]$/.test(key)) {
            event.preventDefault()
            event.target.value = '' // Clear the input field
            setFormErrors((prevErrors) => ({
                ...prevErrors,
                [name]: 'First character must be an alphabet'
            }))
        }

        // Allow valid characters only
        if (!regex.test(key)) {
            event.preventDefault()
            // event.target.value = "";  // Clear the input field
            // setFormErrors((prevErrors) => ({
            //     ...prevErrors,
            //     [name]: 'Invalid character detected',
            // }));
        }
    }

    // Handle paste validation
    if (event.type === 'paste') {
        const pastedText = (event.clipboardData || window.clipboardData).getData('text').trim()
        const newValue = value.length === 0 ? pastedText : value + pastedText

        if (!isValid(newValue)) {
            event.target.value = '' // Clear the input field
            setFormErrors((prevErrors) => ({
                ...prevErrors,
                [name]: 'Pasted content must be alphanumeric, start with an alphabet, and contain only . , ! ? -'
            }))
            event.preventDefault()
        }
    }

    // Handle input validation
    if (event.type === 'input') {
        let newValue = event.target.value

        // Trim leading spaces
        if (newValue.startsWith(' ')) {
            newValue = newValue.trimStart()
            event.target.value = newValue
        }

        if (!isValid(newValue) && newValue.length > 0) {
            event.target.value = '' // Clear the input field
            setFormErrors((prevErrors) => ({
                ...prevErrors,
                [name]: 'Input should be alphanumeric, start with an alphabet, and contain only . , ! ? -'
            }))
        } else {
            setFormErrors((prevErrors) => ({
                ...prevErrors,
                [name]: ''
            }))
        }
    }
}

export const isCompareDateValid = (compareDate, dateRanges) => {
    for (let range of dateRanges) {
        const [start, end] = range.split(' to ').map((date) => moment(date, 'YYYY-MM-DD'))
        const compareMoment = moment(compareDate, 'YYYY-MM-DD')
        if (compareMoment.isSameOrAfter(start) && compareMoment.isSameOrBefore(end)) {
            return false
        }
    }
    return true
}

export const updateValidation = (obj1, obj2) => {
    if (obj1 === obj2) return true

    if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
        return false
    }

    const keys1 = Object.keys(obj1)
    const keys2 = Object.keys(obj2)

    if (keys1.length !== keys2.length) return false

    for (let key of keys1) {
        if (!keys2.includes(key)) return false
        if (!updateValidation(obj1[key], obj2[key])) return false
    }

    return true
}

export const compareArrayOfObjects = (arr1, arr2) => {
    arr1 = arr1 || []
    arr2 = arr2 || []
    if (arr1.length !== arr2.length) return false

    for (let i = 0; i < arr1.length; i++) {
        if (!updateValidation(arr1[i], arr2[i])) return false
    }
    return true
}

export const compareArrays = (arr1, arr2) => {
    arr1 = arr1 || []
    arr2 = arr2 || []
    if (arr1.length !== arr2.length) return false
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false
    }
    return true
}

export const  comparePhoto = (oldData, newData) => {
    console.log(oldData.photo,newData.photo,"photo comparison");
    if (oldData?.photo === newData?.photo) {
        return true;
    }
    return false;
}