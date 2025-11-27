import validator from 'validator'

const ValidateZipCode = (countries, countryId, value, zipValue) => {
    //handling zipcode whether the enetered zipcode is correct ot not for 4 countries only
    const matchedCountry =
        countries &&
        countries.find((country) =>
            zipValue ? country.id === countryId : country.countryId === countryId
        )
    const validLocales = ['IN', 'US', 'GB', 'CA'] //india,usa,great britan,cannada
    const modifiedString = matchedCountry && matchedCountry.isoCode.slice(0, -1)
    const isSupportedLocale = validLocales.includes(modifiedString)
    if (matchedCountry && isSupportedLocale) {
        if (!value || value.trim() === '') {
            return { isValid: true, error: 'Required' } // No value means no validation error
        } else if (value && validator.isPostalCode(value, modifiedString)) {
            return { isValid: true, error: '' }
        } else {
            return { isValid: false, error: `Invalid zipCode for ${matchedCountry.isoCode}` }
        }
    }

    return { isValid: true, error: '' } // Handle case where country is not found
}

export default ValidateZipCode
