// Initialize date-related letiables
const getSelectedDate = document.getElementById('calendar-pane').getAttribute('selected-date');
const selectedDate = new Date(getSelectedDate);
let currentMonth = selectedDate.getMonth();
let currentYear = selectedDate.getFullYear();
let selectYear = document.getElementById("year");
let selectMonth = document.getElementById("month");
const today = new Date();

const createYear = generate_year_range(1970, 2050);

document.getElementById("year").innerHTML = createYear;

let calendar = document.getElementById("calendar");

let months = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December"
];

let days = [
	"S", "M", "T", "W",
	"T", "F", "S"];

// Function to generate a range of years for the year select input
function generate_year_range(start, end) {
	let years = "";
	for (let year = start; year <= end; year++) {
		years += `<option value='${year}'>${year}</option>`;
	};
	return years;
};


// DOW display 
let $dataHead = "<tr>";
for (dhead in days) {
	$dataHead += `<th data-days='${days[dhead]}'>${days[dhead]}</th>`;
}
$dataHead += "</tr>";

document.getElementById("thead-month").innerHTML = $dataHead;

const monthAndYear = document.getElementById("monthAndYear");
showCalendar(currentMonth, currentYear);

// Function to navigate to the next month
function next() {
	currentYear = currentMonth === 11 ?
		currentYear + 1 : currentYear;
	currentMonth = (currentMonth + 1) % 12;
	showCalendar(currentMonth, currentYear);
};

// Function to navigate to the previous month
function previous() {
	currentYear = currentMonth === 0 ?
		currentYear - 1 : currentYear;
	currentMonth = currentMonth === 0 ?
		11 : currentMonth - 1;
	showCalendar(currentMonth, currentYear);
};

// Function to jump to a specific month and year
function jump() {
	currentYear = parseInt(selectYear.value);
	currentMonth = parseInt(selectMonth.value);
	showCalendar(currentMonth, currentYear);
};

// Function to display the calendar
function showCalendar(month, year) {
	const firstDay = new Date(year, month, 1).getDay();
	const tbl = document.getElementById("calendar-body");
	tbl.innerHTML = "";
	monthAndYear.innerHTML = `${months[month]} ${year}`;
	selectYear.value = year;
	selectMonth.value = month;

	let date = 1;
	for (let week = 0; week < 6; week++) {
    if (date > daysInMonth(month, year)) break;
		let row = document.createElement("tr");
		for (let weekDay = 0; weekDay < 7; weekDay++) {
			if (week === 0 && weekDay < firstDay) {
				const cell = document.createElement("td");
				cellText = document.createTextNode("");
				cell.appendChild(cellText);
				row.appendChild(cell);
			} else if (date > daysInMonth(month, year)) {
        cell = document.createElement("td");
				cellText = document.createTextNode("");
				cell.appendChild(cellText);
				row.appendChild(cell);
			} else {
				const cell = document.createElement("td");
				cell.setAttribute("data-date", date);
				cell.setAttribute("data-month", month + 1);
				cell.setAttribute("data-year", year);
				cell.setAttribute("data-month_name", months[month]);
				cell.className = "date-picker";
				// cell.innerHTML = `<span>${date}</span>`; // TODO: a href
        const dateLink = document.createElement('a');
        dateLink.setAttribute('href', `/main-window/?date=${year}-${month + 1}-${date}`);
        dateLink.className = 'date-link';
				dateLink.innerHTML = `<span>${date}</span>`; // TODO: a href
				if (
					date === selectedDate.getDate() &&
					year === selectedDate.getFullYear() &&
					month === selectedDate.getMonth()
				) {
					cell.classList.add('selected');
				};

        cell.appendChild(dateLink)

				// delegate date-picker selected to ejs
				if ( 
					date === today.getDate() &&
					year === today.getFullYear() &&
					month === today.getMonth()
				) {
					cell.classList.add('today');
				};

				row.appendChild(cell);
				date++;
			};
		};
		tbl.appendChild(row);
	};
};

// Function to get the number of days in a month
function daysInMonth(month, year) {
	return new Date(year, month + 1, 0).getDate();
};

// Call the showCalendar function initially to display the calendar
showCalendar(currentMonth, currentYear);
