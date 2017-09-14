
const _ = require('lodash');
const axios = require('axios');

const shopify = axios.create({
  baseURL: 'https://backend-challenge-winter-2017.herokuapp.com',
  timeout: 4500,
});

function checkDataType(data, type) {
  if (type == 'boolean') {
    data = (data === 'true')
  };
  if (typeof(data) === type) {
    // no errors
    return false;
  } else {
    return true;
  }
}
function validateCustomer(customer, validations) {
  var invalid_field = [];
  var error;
  var valid = true;

  for (v in validations) {
    valid = validateField(customer, validations[v])
    if (!valid) invalid_field.push(_.keys(validations[v]))
  }

  if (!valid) {
    error = {id: customer.id, invalid_fields: invalid_field};
    return error
  }

  return
}

function validateField(customer, validation) {

  var key = _.keys(validation);
  var value = validation[key];
  let length = value.length;

  if (!value.required) return true

  if (!customer[key] || (value.type && checkDataType(customer[key], value.type)) || (length && ((length.min && customer[key].length < length.min) || (length.max && costumer[key] > length.max)))) {
      return false
  }

}

function getCustomerValidations(page = 1, totalPages = 1, results = []) {
  if (page > totalPages) {
    var toReturn = {
      invalid_customers: results
    }

    console.log(toReturn);
    return toReturn;
  }
  return shopify.get('/customers.json', {
    params: {
      page
    },
  })
  .then(response => {
    if (response.status !== 200) throw new Error('Non-200 response from API');

    // Exit if there is no data
    if (_.isEmpty(response.data)) return results;

    const validations = response.data.validations;
    const customers = response.data.customers;
    const pagination = response.data.pagination;

    for (c in customers) {
      results.push(validateCustomer(customers[c], validations))
    }

    totalPages = Math.ceil(pagination.total/pagination.per_page);

    return getCustomerValidations(page + 1, totalPages, results);
  });
}

getCustomerValidations()
  .catch(console.error);
