/**
 * This is a scaffold for defining a Workbook with Sheets and Portals.
 * Test this scaffold using the sample file in examples/sample-uploads/my-sheet-sample.csv.
 *
 * See examples/workbooks/FullExample.ts for a full, working example of a Workbook.
 */

import {
  BooleanField,
  OptionField,
  Portal,
  Sheet,
  TextField,
  Workbook,
} from '@flatfile/configure'
import { formatPhoneNumber } from '../helpers/formatPhoneNumber.js'
import { countries } from '../helpers/countries.js'
import {format, isDate, isFuture, parseISO} from "date-fns";
/**
 * Sheets
 * Define your Sheet configuration and Fields here, or import them:
 * import { YourSheet } from './path-to-your-sheet/your-sheet.ts'
 */
const ContactSheet = new Sheet('ContactSheet', {
  firstName: TextField({
    required: true,
    description: "First or full name",
    label: "First Name"
  }),
  lastName: TextField({label: "Last Name"}),
  email: TextField({
    label: "Email",
    description: "Please please enter your email",
    unique: true
  }),
  phone: TextField({label: "Phone number"}),
  date: TextField({label: "Date"}),
  country: TextField({label: "Country"}),
  zipCode: TextField({label: "Zip Code"}),
  subscriber: BooleanField({label: "Subscriber"}),
  type: OptionField({
    label: 'Deal Status',
    options: {
      new: { label: 'New' },
      interested: { label: 'Interested' },
      meeting: { label: 'Meeting' },
      opportunity: { label: 'Opportunity' },
      unqualified: { label: 'Not a fit' },
    },
  }),
},
{  recordCompute: (record) => {
  const { email, phone, date, country, zipCode } = record.value
    if (email.includes('flatfile.io')) {
      record.addError("email", "Flatfile emails should use flatfile.com ending only")
    }
    if (!email && !phone) {
      record.addWarning(["email", "phone"], "Please include one of either Phone or Email.")
    }
    if (phone) {
      let validPhone = formatPhoneNumber(phone)
      if (validPhone !== "Invalid phone number") {
        record.set("phone", validPhone)
      } else {
        record.addError("phone", "This does not appear to be a valid phone number")
      }
    }
    if (date) {
      let thisDate = format(new Date(date), "yyyy-MM-dd");
      let realDate = parseISO(thisDate);
      if (isDate(realDate)) {
        record.set("date", thisDate)
        isFuture(realDate) && record.addError("date", "Date cannot be in the future.");
      } else {
        record.addError("date", "Please check that the date is formatted YYYY-MM-DD.")
      }
    }
    if (country) {
      if (!countries.find((c) => c.code === country)) {
        const suggestion = countries.find(
            (c) => c.name.toLowerCase().indexOf(country.toLowerCase()) !== -1
        );
        record.set("country", suggestion ? suggestion.code : country);
        !suggestion && record.addError("country", "Country code is not valid")
      }
    }
    if (zipCode && zipCode.length < 5 && country === "US") {
      record.set("zipCode", zipCode.padStart(5, "0"))
      record.addInfo("zipCode", "Zipcode was padded with zeroes")
    }
    return record;
  }})

/**
 * Portals
 * Define your Portals here, or import them:
 * import { YourPortal } from './path-to-your-portal/your-portal.ts'
 */
const ContactPortal = new Portal({
  name: 'ContactPortal',
  sheet: 'ContactSheet',
})

// Workbook  - Update to reference your Workbook with Sheet(s) and Portal(s)
export default new Workbook({
  name: 'ContactWorkbook',
  namespace: 'contact-workbook',
  portals: [ContactPortal],
  sheets: {
    ContactSheet,
  },
})
