const Validator = require('is-my-json-valid');
const SpeedDate = require('speed-date');
const schemas = require('./schemas.json');

exports.generate = generate;
exports.validate = validate;

const validateDLN = Validator(schemas.dln);
const validateFinalChars = Validator(schemas.finalCharacters);
const validateUserDetails = Validator(schemas.userDetails);
const dateFormatter = SpeedDate('YYMMDD');

function generate(userDetails, finalCharacters) {
	if (userDetails === void 0)
		userDetails = null;

	if (finalCharacters === void 0)
		finalCharacters = null;

	if (!validateUserDetails(userDetails))
		throw new Error('user details invalid');

	if (finalCharacters !== null && !validateFinalChars(finalCharacters))
		throw new Error('final characters invalid');

	const sectA = generateSectionA(userDetails.familyName);
	const sectB = generateSectionB(userDetails.birthDate, userDetails.sex);
	const sectC = generateSectionC(userDetails.personalName);

	const subDLN = sectA + sectB + sectC;

	if (!finalCharacters)
		return subDLN;

	return subDLN + finalCharacters;
}

function validate(dln, userDetails) {
	if (dln === void 0)
		dln = null;

	if (userDetails === void 0)
		userDetails = null;

	if (userDetails !== null && !validateUserDetails(userDetails))
		throw new Error('user details invalid');

	if (!validateDLN(dln))
		return false;

	if (!userDetails)
		return true;

	return generate(userDetails) === dln.substr(0, 13);
}

function clean(str) {
	return str.toUpperCase().replace(/[^A-Z]/g, '');
}

function generateSectionA(familyName) {
	const base = clean(familyName).replace(/^MAC/i, 'MC');
	return (base + '9999').substr(0, 5);
}

function generateSectionB(birthDate, sex) {
	const date = dateFormatter(new Date(birthDate));
	const year = date.substr(0, 2);
	var month = date.substr(2, 2);
	const day = date.substr(4, 2);

	if (sex === 'F')
		month = (parseInt(month[0], 10) + 5).toString() + month[1];

	return year[0] + month + day + year[1];
}

function generateSectionC(personalName) {
	const names = (personalName || '').split(/\s/).map(clean).filter(function (n) { return !!n; });
	const initials = names.slice(0, 2).map(function (n) { return n.substr(0, 1); }).join('');
	return (initials + '99').substr(0, 2);
}
