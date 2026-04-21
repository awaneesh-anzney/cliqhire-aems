import { Country } from "@/types/countryCodes";

export const COUNTRIES: Country[] = [
  { code: "AF", name: "Afghanistan",                    dialCode: "+93",   flag: "🇦🇫", minLength: 9,  maxLength: 9  },
  { code: "AL", name: "Albania",                        dialCode: "+355",  flag: "🇦🇱", minLength: 9,  maxLength: 9  },
  { code: "DZ", name: "Algeria",                        dialCode: "+213",  flag: "🇩🇿", minLength: 9,  maxLength: 9  },
  { code: "AD", name: "Andorra",                        dialCode: "+376",  flag: "🇦🇩", minLength: 6,  maxLength: 9  },
  { code: "AO", name: "Angola",                         dialCode: "+244",  flag: "🇦🇴", minLength: 9,  maxLength: 9  },
  { code: "AG", name: "Antigua and Barbuda",            dialCode: "+1268", flag: "🇦🇬", minLength: 7,  maxLength: 7  },
  { code: "AR", name: "Argentina",                      dialCode: "+54",   flag: "🇦🇷", minLength: 10, maxLength: 11 },
  { code: "AM", name: "Armenia",                        dialCode: "+374",  flag: "🇦🇲", minLength: 8,  maxLength: 8  },
  { code: "AU", name: "Australia",                      dialCode: "+61",   flag: "🇦🇺", minLength: 9,  maxLength: 9  },
  { code: "AT", name: "Austria",                        dialCode: "+43",   flag: "🇦🇹", minLength: 7,  maxLength: 13 },
  { code: "AZ", name: "Azerbaijan",                     dialCode: "+994",  flag: "🇦🇿", minLength: 9,  maxLength: 9  },
  { code: "BS", name: "Bahamas",                        dialCode: "+1242", flag: "🇧🇸", minLength: 7,  maxLength: 7  },
  { code: "BH", name: "Bahrain",                        dialCode: "+973",  flag: "🇧🇭", minLength: 8,  maxLength: 8  },
  { code: "BD", name: "Bangladesh",                     dialCode: "+880",  flag: "🇧🇩", minLength: 10, maxLength: 10 },
  { code: "BB", name: "Barbados",                       dialCode: "+1246", flag: "🇧🇧", minLength: 7,  maxLength: 7  },
  { code: "BY", name: "Belarus",                        dialCode: "+375",  flag: "🇧🇾", minLength: 9,  maxLength: 10 },
  { code: "BE", name: "Belgium",                        dialCode: "+32",   flag: "🇧🇪", minLength: 8,  maxLength: 9  },
  { code: "BZ", name: "Belize",                         dialCode: "+501",  flag: "🇧🇿", minLength: 7,  maxLength: 7  },
  { code: "BJ", name: "Benin",                          dialCode: "+229",  flag: "🇧🇯", minLength: 8,  maxLength: 8  },
  { code: "BT", name: "Bhutan",                         dialCode: "+975",  flag: "🇧🇹", minLength: 7,  maxLength: 8  },
  { code: "BO", name: "Bolivia",                        dialCode: "+591",  flag: "🇧🇴", minLength: 8,  maxLength: 8  },
  { code: "BA", name: "Bosnia and Herzegovina",         dialCode: "+387",  flag: "🇧🇦", minLength: 8,  maxLength: 8  },
  { code: "BW", name: "Botswana",                       dialCode: "+267",  flag: "🇧🇼", minLength: 7,  maxLength: 8  },
  { code: "BR", name: "Brazil",                         dialCode: "+55",   flag: "🇧🇷", minLength: 10, maxLength: 11 },
  { code: "BN", name: "Brunei",                         dialCode: "+673",  flag: "🇧🇳", minLength: 7,  maxLength: 7  },
  { code: "BG", name: "Bulgaria",                       dialCode: "+359",  flag: "🇧🇬", minLength: 8,  maxLength: 9  },
  { code: "BF", name: "Burkina Faso",                   dialCode: "+226",  flag: "🇧🇫", minLength: 8,  maxLength: 8  },
  { code: "BI", name: "Burundi",                        dialCode: "+257",  flag: "🇧🇮", minLength: 8,  maxLength: 8  },
  { code: "CV", name: "Cabo Verde",                     dialCode: "+238",  flag: "🇨🇻", minLength: 7,  maxLength: 7  },
  { code: "KH", name: "Cambodia",                       dialCode: "+855",  flag: "🇰🇭", minLength: 8,  maxLength: 9  },
  { code: "CM", name: "Cameroon",                       dialCode: "+237",  flag: "🇨🇲", minLength: 9,  maxLength: 9  },
  { code: "CA", name: "Canada",                         dialCode: "+1",    flag: "🇨🇦", minLength: 10, maxLength: 10, regex: /^[2-9]\d{9}$/ },
  { code: "CF", name: "Central African Republic",       dialCode: "+236",  flag: "🇨🇫", minLength: 8,  maxLength: 8  },
  { code: "TD", name: "Chad",                           dialCode: "+235",  flag: "🇹🇩", minLength: 8,  maxLength: 8  },
  { code: "CL", name: "Chile",                          dialCode: "+56",   flag: "🇨🇱", minLength: 9,  maxLength: 9  },
  { code: "CN", name: "China",                          dialCode: "+86",   flag: "🇨🇳", minLength: 11, maxLength: 11, regex: /^1[3-9]\d{9}$/ },
  { code: "CO", name: "Colombia",                       dialCode: "+57",   flag: "🇨🇴", minLength: 10, maxLength: 10 },
  { code: "KM", name: "Comoros",                        dialCode: "+269",  flag: "🇰🇲", minLength: 7,  maxLength: 7  },
  { code: "CG", name: "Congo",                          dialCode: "+242",  flag: "🇨🇬", minLength: 9,  maxLength: 9  },
  { code: "CD", name: "Congo (DRC)",                    dialCode: "+243",  flag: "🇨🇩", minLength: 9,  maxLength: 9  },
  { code: "CR", name: "Costa Rica",                     dialCode: "+506",  flag: "🇨🇷", minLength: 8,  maxLength: 8  },
  { code: "HR", name: "Croatia",                        dialCode: "+385",  flag: "🇭🇷", minLength: 8,  maxLength: 9  },
  { code: "CU", name: "Cuba",                           dialCode: "+53",   flag: "🇨🇺", minLength: 8,  maxLength: 8  },
  { code: "CY", name: "Cyprus",                         dialCode: "+357",  flag: "🇨🇾", minLength: 8,  maxLength: 8  },
  { code: "CZ", name: "Czech Republic",                 dialCode: "+420",  flag: "🇨🇿", minLength: 9,  maxLength: 9  },
  { code: "DK", name: "Denmark",                        dialCode: "+45",   flag: "🇩🇰", minLength: 8,  maxLength: 8  },
  { code: "DJ", name: "Djibouti",                       dialCode: "+253",  flag: "🇩🇯", minLength: 8,  maxLength: 8  },
  { code: "DM", name: "Dominica",                       dialCode: "+1767", flag: "🇩🇲", minLength: 7,  maxLength: 7  },
  { code: "DO", name: "Dominican Republic",             dialCode: "+1809", flag: "🇩🇴", minLength: 7,  maxLength: 7  },
  { code: "EC", name: "Ecuador",                        dialCode: "+593",  flag: "🇪🇨", minLength: 9,  maxLength: 9  },
  { code: "EG", name: "Egypt",                          dialCode: "+20",   flag: "🇪🇬", minLength: 10, maxLength: 10 },
  { code: "SV", name: "El Salvador",                    dialCode: "+503",  flag: "🇸🇻", minLength: 8,  maxLength: 8  },
  { code: "GQ", name: "Equatorial Guinea",              dialCode: "+240",  flag: "🇬🇶", minLength: 9,  maxLength: 9  },
  { code: "ER", name: "Eritrea",                        dialCode: "+291",  flag: "🇪🇷", minLength: 7,  maxLength: 7  },
  { code: "EE", name: "Estonia",                        dialCode: "+372",  flag: "🇪🇪", minLength: 7,  maxLength: 8  },
  { code: "SZ", name: "Eswatini",                       dialCode: "+268",  flag: "🇸🇿", minLength: 8,  maxLength: 8  },
  { code: "ET", name: "Ethiopia",                       dialCode: "+251",  flag: "🇪🇹", minLength: 9,  maxLength: 9  },
  { code: "FJ", name: "Fiji",                           dialCode: "+679",  flag: "🇫🇯", minLength: 7,  maxLength: 7  },
  { code: "FI", name: "Finland",                        dialCode: "+358",  flag: "🇫🇮", minLength: 9,  maxLength: 11 },
  { code: "FR", name: "France",                         dialCode: "+33",   flag: "🇫🇷", minLength: 9,  maxLength: 9  },
  { code: "GA", name: "Gabon",                          dialCode: "+241",  flag: "🇬🇦", minLength: 7,  maxLength: 8  },
  { code: "GM", name: "Gambia",                         dialCode: "+220",  flag: "🇬🇲", minLength: 7,  maxLength: 7  },
  { code: "GE", name: "Georgia",                        dialCode: "+995",  flag: "🇬🇪", minLength: 9,  maxLength: 9  },
  { code: "DE", name: "Germany",                        dialCode: "+49",   flag: "🇩🇪", minLength: 10, maxLength: 11 },
  { code: "GH", name: "Ghana",                          dialCode: "+233",  flag: "🇬🇭", minLength: 9,  maxLength: 9  },
  { code: "GR", name: "Greece",                         dialCode: "+30",   flag: "🇬🇷", minLength: 10, maxLength: 10 },
  { code: "GD", name: "Grenada",                        dialCode: "+1473", flag: "🇬🇩", minLength: 7,  maxLength: 7  },
  { code: "GT", name: "Guatemala",                      dialCode: "+502",  flag: "🇬🇹", minLength: 8,  maxLength: 8  },
  { code: "GN", name: "Guinea",                         dialCode: "+224",  flag: "🇬🇳", minLength: 9,  maxLength: 9  },
  { code: "GW", name: "Guinea-Bissau",                  dialCode: "+245",  flag: "🇬🇼", minLength: 7,  maxLength: 7  },
  { code: "GY", name: "Guyana",                         dialCode: "+592",  flag: "🇬🇾", minLength: 7,  maxLength: 7  },
  { code: "HT", name: "Haiti",                          dialCode: "+509",  flag: "🇭🇹", minLength: 8,  maxLength: 8  },
  { code: "HN", name: "Honduras",                       dialCode: "+504",  flag: "🇭🇳", minLength: 8,  maxLength: 8  },
  { code: "HU", name: "Hungary",                        dialCode: "+36",   flag: "🇭🇺", minLength: 9,  maxLength: 9  },
  { code: "IS", name: "Iceland",                        dialCode: "+354",  flag: "🇮🇸", minLength: 7,  maxLength: 9  },
  { code: "IN", name: "India",                          dialCode: "+91",   flag: "🇮🇳", minLength: 10, maxLength: 10, regex: /^[6-9]\d{9}$/ },
  { code: "ID", name: "Indonesia",                      dialCode: "+62",   flag: "🇮🇩", minLength: 9,  maxLength: 12 },
  { code: "IR", name: "Iran",                           dialCode: "+98",   flag: "🇮🇷", minLength: 10, maxLength: 10 },
  { code: "IQ", name: "Iraq",                           dialCode: "+964",  flag: "🇮🇶", minLength: 10, maxLength: 10 },
  { code: "IE", name: "Ireland",                        dialCode: "+353",  flag: "🇮🇪", minLength: 9,  maxLength: 9  },
  { code: "IL", name: "Israel",                         dialCode: "+972",  flag: "🇮🇱", minLength: 9,  maxLength: 9  },
  { code: "IT", name: "Italy",                          dialCode: "+39",   flag: "🇮🇹", minLength: 9,  maxLength: 11 },
  { code: "JM", name: "Jamaica",                        dialCode: "+1876", flag: "🇯🇲", minLength: 7,  maxLength: 7  },
  { code: "JP", name: "Japan",                          dialCode: "+81",   flag: "🇯🇵", minLength: 10, maxLength: 11 },
  { code: "JO", name: "Jordan",                         dialCode: "+962",  flag: "🇯🇴", minLength: 9,  maxLength: 9  },
  { code: "KZ", name: "Kazakhstan",                     dialCode: "+7",    flag: "🇰🇿", minLength: 10, maxLength: 10 },
  { code: "KE", name: "Kenya",                          dialCode: "+254",  flag: "🇰🇪", minLength: 9,  maxLength: 9  },
  { code: "KI", name: "Kiribati",                       dialCode: "+686",  flag: "🇰🇮", minLength: 8,  maxLength: 8  },
  { code: "KW", name: "Kuwait",                         dialCode: "+965",  flag: "🇰🇼", minLength: 8,  maxLength: 8  },
  { code: "KG", name: "Kyrgyzstan",                     dialCode: "+996",  flag: "🇰🇬", minLength: 9,  maxLength: 9  },
  { code: "LA", name: "Laos",                           dialCode: "+856",  flag: "🇱🇦", minLength: 8,  maxLength: 9  },
  { code: "LV", name: "Latvia",                         dialCode: "+371",  flag: "🇱🇻", minLength: 8,  maxLength: 8  },
  { code: "LB", name: "Lebanon",                        dialCode: "+961",  flag: "🇱🇧", minLength: 7,  maxLength: 8  },
  { code: "LS", name: "Lesotho",                        dialCode: "+266",  flag: "🇱🇸", minLength: 8,  maxLength: 8  },
  { code: "LR", name: "Liberia",                        dialCode: "+231",  flag: "🇱🇷", minLength: 7,  maxLength: 8  },
  { code: "LY", name: "Libya",                          dialCode: "+218",  flag: "🇱🇾", minLength: 9,  maxLength: 9  },
  { code: "LI", name: "Liechtenstein",                  dialCode: "+423",  flag: "🇱🇮", minLength: 7,  maxLength: 9  },
  { code: "LT", name: "Lithuania",                      dialCode: "+370",  flag: "🇱🇹", minLength: 8,  maxLength: 8  },
  { code: "LU", name: "Luxembourg",                     dialCode: "+352",  flag: "🇱🇺", minLength: 9,  maxLength: 9  },
  { code: "MG", name: "Madagascar",                     dialCode: "+261",  flag: "🇲🇬", minLength: 9,  maxLength: 9  },
  { code: "MW", name: "Malawi",                         dialCode: "+265",  flag: "🇲🇼", minLength: 9,  maxLength: 9  },
  { code: "MY", name: "Malaysia",                       dialCode: "+60",   flag: "🇲🇾", minLength: 9,  maxLength: 10 },
  { code: "MV", name: "Maldives",                       dialCode: "+960",  flag: "🇲🇻", minLength: 7,  maxLength: 7  },
  { code: "ML", name: "Mali",                           dialCode: "+223",  flag: "🇲🇱", minLength: 8,  maxLength: 8  },
  { code: "MT", name: "Malta",                          dialCode: "+356",  flag: "🇲🇹", minLength: 8,  maxLength: 8  },
  { code: "MH", name: "Marshall Islands",               dialCode: "+692",  flag: "🇲🇭", minLength: 7,  maxLength: 7  },
  { code: "MR", name: "Mauritania",                     dialCode: "+222",  flag: "🇲🇷", minLength: 8,  maxLength: 8  },
  { code: "MU", name: "Mauritius",                      dialCode: "+230",  flag: "🇲🇺", minLength: 8,  maxLength: 8  },
  { code: "MX", name: "Mexico",                         dialCode: "+52",   flag: "🇲🇽", minLength: 10, maxLength: 10 },
  { code: "FM", name: "Micronesia",                     dialCode: "+691",  flag: "🇫🇲", minLength: 7,  maxLength: 7  },
  { code: "MD", name: "Moldova",                        dialCode: "+373",  flag: "🇲🇩", minLength: 8,  maxLength: 8  },
  { code: "MC", name: "Monaco",                         dialCode: "+377",  flag: "🇲🇨", minLength: 8,  maxLength: 9  },
  { code: "MN", name: "Mongolia",                       dialCode: "+976",  flag: "🇲🇳", minLength: 8,  maxLength: 8  },
  { code: "ME", name: "Montenegro",                     dialCode: "+382",  flag: "🇲🇪", minLength: 8,  maxLength: 8  },
  { code: "MA", name: "Morocco",                        dialCode: "+212",  flag: "🇲🇦", minLength: 9,  maxLength: 9  },
  { code: "MZ", name: "Mozambique",                     dialCode: "+258",  flag: "🇲🇿", minLength: 9,  maxLength: 9  },
  { code: "MM", name: "Myanmar",                        dialCode: "+95",   flag: "🇲🇲", minLength: 8,  maxLength: 10 },
  { code: "NA", name: "Namibia",                        dialCode: "+264",  flag: "🇳🇦", minLength: 8,  maxLength: 9  },
  { code: "NR", name: "Nauru",                          dialCode: "+674",  flag: "🇳🇷", minLength: 7,  maxLength: 7  },
  { code: "NP", name: "Nepal",                          dialCode: "+977",  flag: "🇳🇵", minLength: 10, maxLength: 10 },
  { code: "NL", name: "Netherlands",                    dialCode: "+31",   flag: "🇳🇱", minLength: 9,  maxLength: 9  },
  { code: "NZ", name: "New Zealand",                    dialCode: "+64",   flag: "🇳🇿", minLength: 8,  maxLength: 10 },
  { code: "NI", name: "Nicaragua",                      dialCode: "+505",  flag: "🇳🇮", minLength: 8,  maxLength: 8  },
  { code: "NE", name: "Niger",                          dialCode: "+227",  flag: "🇳🇪", minLength: 8,  maxLength: 8  },
  { code: "NG", name: "Nigeria",                        dialCode: "+234",  flag: "🇳🇬", minLength: 10, maxLength: 10 },
  { code: "KP", name: "North Korea",                    dialCode: "+850",  flag: "🇰🇵", minLength: 8,  maxLength: 10 },
  { code: "MK", name: "North Macedonia",                dialCode: "+389",  flag: "🇲🇰", minLength: 8,  maxLength: 8  },
  { code: "NO", name: "Norway",                         dialCode: "+47",   flag: "🇳🇴", minLength: 8,  maxLength: 8  },
  { code: "OM", name: "Oman",                           dialCode: "+968",  flag: "🇴🇲", minLength: 8,  maxLength: 8  },
  { code: "PK", name: "Pakistan",                       dialCode: "+92",   flag: "🇵🇰", minLength: 10, maxLength: 10, regex: /^3\d{9}$/ },
  { code: "PW", name: "Palau",                          dialCode: "+680",  flag: "🇵🇼", minLength: 7,  maxLength: 7  },
  { code: "PA", name: "Panama",                         dialCode: "+507",  flag: "🇵🇦", minLength: 8,  maxLength: 8  },
  { code: "PG", name: "Papua New Guinea",               dialCode: "+675",  flag: "🇵🇬", minLength: 8,  maxLength: 8  },
  { code: "PY", name: "Paraguay",                       dialCode: "+595",  flag: "🇵🇾", minLength: 9,  maxLength: 9  },
  { code: "PE", name: "Peru",                           dialCode: "+51",   flag: "🇵🇪", minLength: 9,  maxLength: 9  },
  { code: "PH", name: "Philippines",                    dialCode: "+63",   flag: "🇵🇭", minLength: 10, maxLength: 10 },
  { code: "PL", name: "Poland",                         dialCode: "+48",   flag: "🇵🇱", minLength: 9,  maxLength: 9  },
  { code: "PT", name: "Portugal",                       dialCode: "+351",  flag: "🇵🇹", minLength: 9,  maxLength: 9  },
  { code: "QA", name: "Qatar",                          dialCode: "+974",  flag: "🇶🇦", minLength: 8,  maxLength: 8  },
  { code: "RO", name: "Romania",                        dialCode: "+40",   flag: "🇷🇴", minLength: 10, maxLength: 10 },
  { code: "RU", name: "Russia",                         dialCode: "+7",    flag: "🇷🇺", minLength: 10, maxLength: 10, regex: /^9\d{9}$/ },
  { code: "RW", name: "Rwanda",                         dialCode: "+250",  flag: "🇷🇼", minLength: 9,  maxLength: 9  },
  { code: "KN", name: "Saint Kitts and Nevis",          dialCode: "+1869", flag: "🇰🇳", minLength: 7,  maxLength: 7  },
  { code: "LC", name: "Saint Lucia",                    dialCode: "+1758", flag: "🇱🇨", minLength: 7,  maxLength: 7  },
  { code: "VC", name: "Saint Vincent and the Grenadines", dialCode: "+1784", flag: "🇻🇨", minLength: 7, maxLength: 7 },
  { code: "WS", name: "Samoa",                          dialCode: "+685",  flag: "🇼🇸", minLength: 5,  maxLength: 7  },
  { code: "SM", name: "San Marino",                     dialCode: "+378",  flag: "🇸🇲", minLength: 6,  maxLength: 10 },
  { code: "ST", name: "Sao Tome and Principe",          dialCode: "+239",  flag: "🇸🇹", minLength: 7,  maxLength: 7  },
  { code: "SAR", name: "Saudi Arabia",                   dialCode: "+966",  flag: "🇸🇦", minLength: 9,  maxLength: 9, regex: /^5\d{8}$/ },
  { code: "SN", name: "Senegal",                        dialCode: "+221",  flag: "🇸🇳", minLength: 9,  maxLength: 9  },
  { code: "RS", name: "Serbia",                         dialCode: "+381",  flag: "🇷🇸", minLength: 8,  maxLength: 9  },
  { code: "SC", name: "Seychelles",                     dialCode: "+248",  flag: "🇸🇨", minLength: 7,  maxLength: 7  },
  { code: "SL", name: "Sierra Leone",                   dialCode: "+232",  flag: "🇸🇱", minLength: 8,  maxLength: 8  },
  { code: "SG", name: "Singapore",                      dialCode: "+65",   flag: "🇸🇬", minLength: 8,  maxLength: 8  },
  { code: "SK", name: "Slovakia",                       dialCode: "+421",  flag: "🇸🇰", minLength: 9,  maxLength: 9  },
  { code: "SI", name: "Slovenia",                       dialCode: "+386",  flag: "🇸🇮", minLength: 8,  maxLength: 8  },
  { code: "SB", name: "Solomon Islands",                dialCode: "+677",  flag: "🇸🇧", minLength: 7,  maxLength: 7  },
  { code: "SO", name: "Somalia",                        dialCode: "+252",  flag: "🇸🇴", minLength: 7,  maxLength: 8  },
  { code: "ZA", name: "South Africa",                   dialCode: "+27",   flag: "🇿🇦", minLength: 9,  maxLength: 9  },
  { code: "KR", name: "South Korea",                    dialCode: "+82",   flag: "🇰🇷", minLength: 9,  maxLength: 10 },
  { code: "SS", name: "South Sudan",                    dialCode: "+211",  flag: "🇸🇸", minLength: 9,  maxLength: 9  },
  { code: "ES", name: "Spain",                          dialCode: "+34",   flag: "🇪🇸", minLength: 9,  maxLength: 9  },
  { code: "LK", name: "Sri Lanka",                      dialCode: "+94",   flag: "🇱🇰", minLength: 9,  maxLength: 9  },
  { code: "SD", name: "Sudan",                          dialCode: "+249",  flag: "🇸🇩", minLength: 9,  maxLength: 9  },
  { code: "SR", name: "Suriname",                       dialCode: "+597",  flag: "🇸🇷", minLength: 7,  maxLength: 7  },
  { code: "SE", name: "Sweden",                         dialCode: "+46",   flag: "🇸🇪", minLength: 9,  maxLength: 10 },
  { code: "CH", name: "Switzerland",                    dialCode: "+41",   flag: "🇨🇭", minLength: 9,  maxLength: 9  },
  { code: "SY", name: "Syria",                          dialCode: "+963",  flag: "🇸🇾", minLength: 9,  maxLength: 9  },
  { code: "TW", name: "Taiwan",                         dialCode: "+886",  flag: "🇹🇼", minLength: 9,  maxLength: 10 },
  { code: "TJ", name: "Tajikistan",                     dialCode: "+992",  flag: "🇹🇯", minLength: 9,  maxLength: 9  },
  { code: "TZ", name: "Tanzania",                       dialCode: "+255",  flag: "🇹🇿", minLength: 9,  maxLength: 9  },
  { code: "TH", name: "Thailand",                       dialCode: "+66",   flag: "🇹🇭", minLength: 9,  maxLength: 9  },
  { code: "TL", name: "Timor-Leste",                    dialCode: "+670",  flag: "🇹🇱", minLength: 7,  maxLength: 8  },
  { code: "TG", name: "Togo",                           dialCode: "+228",  flag: "🇹🇬", minLength: 8,  maxLength: 8  },
  { code: "TO", name: "Tonga",                          dialCode: "+676",  flag: "🇹🇴", minLength: 5,  maxLength: 7  },
  { code: "TT", name: "Trinidad and Tobago",            dialCode: "+1868", flag: "🇹🇹", minLength: 7,  maxLength: 7  },
  { code: "TN", name: "Tunisia",                        dialCode: "+216",  flag: "🇹🇳", minLength: 8,  maxLength: 8  },
  { code: "TR", name: "Turkey",                         dialCode: "+90",   flag: "🇹🇷", minLength: 10, maxLength: 10, regex: /^5\d{9}$/ },
  { code: "TM", name: "Turkmenistan",                   dialCode: "+993",  flag: "🇹🇲", minLength: 8,  maxLength: 8  },
  { code: "TV", name: "Tuvalu",                         dialCode: "+688",  flag: "🇹🇻", minLength: 5,  maxLength: 6  },
  { code: "UG", name: "Uganda",                         dialCode: "+256",  flag: "🇺🇬", minLength: 9,  maxLength: 9  },
  { code: "UA", name: "Ukraine",                        dialCode: "+380",  flag: "🇺🇦", minLength: 9,  maxLength: 9  },
  { code: "AE", name: "United Arab Emirates",           dialCode: "+971",  flag: "🇦🇪", minLength: 9,  maxLength: 9, regex: /^5\d{8}$/ },
  { code: "GB", name: "United Kingdom",                 dialCode: "+44",   flag: "🇬🇧", minLength: 10, maxLength: 10 },
  { code: "US", name: "United States",                  dialCode: "+1",    flag: "🇺🇸", minLength: 10, maxLength: 10, regex: /^[2-9]\d{9}$/ },
  { code: "UY", name: "Uruguay",                        dialCode: "+598",  flag: "🇺🇾", minLength: 8,  maxLength: 9  },
  { code: "UZ", name: "Uzbekistan",                     dialCode: "+998",  flag: "🇺🇿", minLength: 9,  maxLength: 9  },
  { code: "VU", name: "Vanuatu",                        dialCode: "+678",  flag: "🇻🇺", minLength: 7,  maxLength: 7  },
  { code: "VE", name: "Venezuela",                      dialCode: "+58",   flag: "🇻🇪", minLength: 10, maxLength: 10 },
  { code: "VN", name: "Vietnam",                        dialCode: "+84",   flag: "🇻🇳", minLength: 9,  maxLength: 10 },
  { code: "YE", name: "Yemen",                          dialCode: "+967",  flag: "🇾🇪", minLength: 9,  maxLength: 9  },
  { code: "ZM", name: "Zambia",                         dialCode: "+260",  flag: "🇿🇲", minLength: 9,  maxLength: 9  },
  { code: "ZW", name: "Zimbabwe",                       dialCode: "+263",  flag: "🇿🇼", minLength: 9,  maxLength: 9  },
];

// ─── Lookup helpers ───────────────────────────────────────────────────────────

/** Get a country entry by ISO code (e.g. "IN") */
export const getCountryByCode = (code: string): Country | null =>
  COUNTRIES.find((c) => c.code === code) || null;

/** Get a country entry by dial code (e.g. "+91") */
export const getCountryByDialCode = (dialCode: string): Country | null =>
  COUNTRIES.find((c) => c.dialCode === dialCode) || null;

// ─── Core validation function ─────────────────────────────────────────────────

/**
 * validatePhone(countryCode, phoneNumber)
 *
 * @param {string} countryCode  — ISO 3166-1 alpha-2, e.g. "IN"
 * @param {string} phoneNumber  — Local number WITHOUT country code, digits only
 *
 * @returns {{ valid: boolean, error: string | null }}
 */
export function validatePhone(countryCode: string, phoneNumber: string): { valid: boolean; error: string | null } {
  // 1. Empty check
  if (!phoneNumber || phoneNumber.trim() === "") {
    return { valid: false, error: "Phone number is required." };
  }

  // 2. Strip any non-digit characters the user may have typed
  const digits = phoneNumber.replace(/\D/g, "");

  // 3. Digits-only check
  if (digits.length === 0) {
    return { valid: false, error: "Please enter a valid phone number." };
  }

  // 4. Lookup country rules
  const country = getCountryByCode(countryCode);

  if (!country) {
    // Unknown country — apply ITU fallback (7–15 digits)
    if (digits.length < 7 || digits.length > 15) {
      return {
        valid: false,
        error: `Phone number must be between 7 and 15 digits.`,
      };
    }
    return { valid: true, error: null };
  }

  // 5. Length check
  if (digits.length < country.minLength || digits.length > country.maxLength) {
    const lengthMsg =
      country.minLength === country.maxLength
        ? `${country.minLength} digits`
        : `${country.minLength}–${country.maxLength} digits`;
    return {
      valid: false,
      error: `${country.name} phone numbers must be ${lengthMsg}.`,
    };
  }

  // 6. Regex check (if defined for this country)
  if (country.regex && !country.regex.test(digits)) {
    return {
      valid: false,
      error: `Invalid ${country.name} phone number format.`,
    };
  }

  return { valid: true, error: null };
}

/**
 * getFullPhone(countryCode, phoneNumber)
 *
 * Returns E.164 format: "+91XXXXXXXXXX"
 * Strips all non-digit characters from local number before combining.
 *
 * @param {string} countryCode  — ISO 3166-1 alpha-2, e.g. "IN"
 * @param {string} phoneNumber  — Local number
 * @returns {string}  E.164 string, or "" if either arg is missing
 */
export function getFullPhone(countryCode: string, phoneNumber: string): string {
  if (!countryCode || !phoneNumber) return "";
  const country = getCountryByCode(countryCode);
  if (!country) return "";
  const digits = phoneNumber.replace(/\D/g, "");
  return `${country.dialCode}${digits}`;
}

/**
 * splitFullPhone(fullPhone)
 *
 * Splits an E.164 number back into { countryCode, localNumber }.
 * Tries longest match first to avoid false positives (e.g. +1 vs +1868).
 *
 * @param {string} fullPhone  — E.164, e.g. "+918888888888"
 * @returns {{ countryCode: string, localNumber: string } | null}
 */
export function splitFullPhone(fullPhone: string): { countryCode: string; localNumber: string } | null {
  if (!fullPhone || !fullPhone.startsWith("+")) return null;

  // Sort by dialCode length descending to match longest prefix first
  const sorted = [...COUNTRIES].sort(
    (a, b) => b.dialCode.length - a.dialCode.length
  );

  for (const country of sorted) {
    if (fullPhone.startsWith(country.dialCode)) {
      return {
        countryCode: country.code,
        localNumber: fullPhone.slice(country.dialCode.length),
      };
    }
  }
  return null;
}