import React from 'react'
import { Route } from 'react-router-dom'
import Country from '../../Components/AppOwner/SeedData/Countries/Country'
import CountryList from '../../Components/AppOwner/SeedData/Countries/CountryList'
import CurrencyList from '../../Components/AppOwner/SeedData/Currencies/CurrencyList'
import EmailEventList from '../../Components/AppOwner/SeedData/EmailEvents/EmailEventList'
import EmploymentTypeList from '../../Components/AppOwner/SeedData/EmploymentTypes/EmploymentTypeList'
import FamilyRelationTypeList from '../../Components/AppOwner/SeedData/FamilyRelationTypes/FamilyRelationTypeList'
import IdProofTypeList from '../../Components/AppOwner/SeedData/IdProofTypes/IdProofTypeList'
import SkillLevelList from '../../Components/AppOwner/SeedData/SkillLevels/SkillLevelList'
import HomePage from '../../Components/HomePage'
import Packages from '../../Components/Packages&Billigs/Packages/Packages'

export default [
    <Route path="/homepage" key="homepage" exact element={<HomePage />} />,
    <Route path="countryList" key="countryList" exact element={<CountryList />} />,
    <Route path="country" key="country" exact element={<Country />} />,
    <Route path="currencyList" key="currencyList" exact element={<CurrencyList />} />,
    <Route path="skillLevelList" key="skillLevelList" exact element={<SkillLevelList />} />,
    <Route path="idProofTypeList" key="idProofTypeList" exact element={<IdProofTypeList />} />,
    <Route
        path="employmentTypeList"
        key="employmentTypeList"
        exact
        element={<EmploymentTypeList />}
    />,
    <Route
        path="familyRelationTypeList"
        key="familyRelationTypeList"
        exact
        element={<FamilyRelationTypeList />}
    />,
    <Route path="emailEventList" key="emailEventList" exact element={<EmailEventList />} />,
    <Route path="packages" key="packages" exact element={<Packages />} />
]
