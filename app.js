//module pattern

//budget controller
var budgetController = (function() {
	
	var Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	Expense.prototype.calcPercentage = function(totalIncome) {

		if(totalIncome > 0){
			this.percentage = Math.round((this.value / totalIncome) * 100);
		} else {
			this.percentage = -1;
		}
	};

	Expense.prototype.getPercentage = function() {
		return this.percentage;
	};


	var Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};	


	var data = {
		allItems: {
			exp: [],
			inc: []			
		},	
		totals: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1	
	};

	var calculateTotal = function(type) {
		var sum = 0;
		data.allItems[type].forEach(function(curr) {
			sum = sum + curr.value;
		});
		data.totals[type] = sum;
	};

	return {
		addItem: function(type, des, val) {
			var newItem;
			//create new ID 
			if(data.allItems[type].lenght > 0) {
				ID = data.allItems[type][data.allItems[type].lenght - 1].id + 1;				
			} else {
				ID = 0;
			}

			//create new item based in 'inc' or 'exp' type
			if(type === 'exp') {
				newItem =	new Expense(ID, des, val);	
			} else if(type === 'inc') {
				newItem =	new Income(ID, des, val);
			}
			//push it into our data structure
			data.allItems[type].push(newItem);

			//return new element
			return newItem;
		},

		deleteItem : function(type, id) {
			var ids, index;
			//function map return an array
			ids = data.allItems[type].map(function(current) {
				return current.id;
			});

			index = ids.indexOf(id);

			if(index !== -1) {
				//.splice removes elements from array
				data.allItems[type].splice(index, 1);
			}
		},

		calculateBudget: function() {
			
			//calculate total income and expenses
			calculateTotal('exp');
			calculateTotal('inc');

			//calculate the budgets: income - expenses
			data.budget = data.totals.inc - data.totals.exp;

			//calculate the percentage of income that we spent
			if(data.totals.inc > 0) {
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			} else {
				data.percentage = -1;

			}
		},


		calculatePercentages: function(){

			data.allItems.exp.forEach(function(cur) {
				cur.calcPercentage(data.totals.inc);
			});
		},


		getPercentages: function() {
			var allPerc = data.allItems.exp.map(function(cur) {
				return cur.getPercentage();
			}); 
			return allPerc;
		},


		getBudget: function() {
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			};
		},

	};

})();


//UI controller
 var UIcontroller = (function() {

 	var DOMstrings = {
 		inputType: '.add__type',
 		inputDescription: '.add__description',
 		inputValue: '.add__value',
 		inputBtn: '.add__btn',
 		incomeContainer: '.income__list',
 		expensesContainer: '.expenses__list',
 		budgetLabel: '.budget__value',
 		incomeLabel : '.budget__income--value',
 		expensesLabel: '.budget__expenses--value',
 		percentageLabel: '.budget__expenses--percentage',
 		container: '.container',
 		expensesPercentageLabel: '.item__percentage',
 		dateLabel: '.budget__title--month'
 	};

 	var formatNumber = function(num, type) {
 			var numSplit, int, dec, sign;
 			// + or - before the numbers. exactly 2 decimal points. and comma separating the thousands
 			num = Math.abs(num);
 			num = num.toFixed(2);
 			//returns an array
 			numSplit = num.split('.');
 			//first element of the array
 			int = numSplit[0];
 			//place the comma
 			if (int.length > 3) {
 				int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 2310, ouput 2,310
 			}


 			dec = numSplit[1];

 			//type === 'exp' ? sign = '-' : sign = '+';

 			return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

 		};


	var nodeListForEach = function(list, callback) {
			for (var i = 0; i < list.length; i++) {
				callback(list[i], i);
			}
		};


 	return {
 		getInput: function() {
 			//create an object in order to return more than 1 variable
 			return {
 				type : document.querySelector(DOMstrings.inputType).value, //will be either inc or exp
 				description : document.querySelector(DOMstrings.inputDescription).value,
 				value : parseFloat(document.querySelector(DOMstrings.inputValue).value)
 			};	
 		},


 		addListItem: function(obj, type) {
 			var html, newhtml, element;
 			//create HTML string with placeholder text
 			if(type === 'inc') {
 				element = DOMstrings.incomeContainer;
 				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
 			} else if(type === 'exp') {
 				element = DOMstrings.expensesContainer;
 				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

 			//replace the placeholder text with actual data
 			newhtml = html.replace('%id%', obj.id);
 			newhtml = newhtml.replace('%description%', obj.description);
 			newhtml = newhtml.replace('%value%', formatNumber(obj.value, type));

 			//insert the HTML into the DOM
 			document.querySelector(element).insertAdjacentHTML('beforeend', newhtml);
 		},


 		deleteListItem: function(selectorID){
 			//remove the child element
 			var el = document.getElementById(selectorID);
 			el.parentNode.removeChild(el);
 		},


 		clearFields: function() {
 			var fields, fieldsArr; 

 			fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

 			fieldsArr = Array.prototype.slice.call(fields);

 			fieldsArr.forEach(function(current, index, array) {
 				current.value = "";
 			});

 			fieldsArr[0].focus();
 		}, 


 		displayBudget: function(obj) {
 			var type;
 			obj.budget > 0 ? type = 'inc' : type = 'exp';

 			document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
 			document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
 			document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

 			if (obj.percentage > 0) {
 				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
 			} else {
 				 document.querySelector(DOMstrings.percentageLabel).textContent = '---';
 			}
 		},


 		displayPercentages: function(percentages) {

 			var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);
 			
 			nodeListForEach(fields, function(current, index) {

 				if (percentages[index] > 0 ){
 					current.textContent = percentages[index] + '%';	
 				} else {
 					current.textContent = '---';
 				}
 			});
 		},
 		

 		displayMonth: function() {
 			var now, year, months, month;

 			//using the date constructor with no parameters will return the current date
 			now = new Date();
 			months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
 			month = now.getMonth();

 			year = now.getFullYear();
 			document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
 		},


 		//change the color of the borders/focus to blue or red when selected an income or expense respectively
 		changedType: function() {

 			var fields = document.querySelectorAll(
 				DOMstrings.inputType + ',' +
 				DOMstrings.inputDescription + ',' +
 				DOMstrings.inputValue);

 			nodeListForEach(fields, function(cur) {
 				cur.classList.toggle('red-focus'); 				
 			});

 			document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
 			//document.querySelector(DOMstrings.inputType).classList.toggle('red-focus');
 			//document.querySelector(DOMstrings.inputDescription).classList.toggle('red-focus');
 			//document.querySelector(DOMstrings.inputValue).classList.toggle('red-focus');
 		},

 		//make the DOMstring public accecible to other frames
 		getDOMstrings: function() {
 			return DOMstrings;
 		}
 	};

 })();



//Global App controller
var controller = (function(budgetCtrl, UIctrl) {

	var setUpEventListener = function() {
		var DOM = UIctrl.getDOMstrings();

		document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

		// add a return(key handler) event handler
		//declared globally so that if happens throughout the whole page
		document.addEventListener('keypress', function(event) {
			//13 is the keycode of the 'enter' key. thw which is for older browsers
			if(event.keyCode === 13 || event.which === 13) {
				ctrlAddItem();
			}
		});

		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

		//Change the color of the borders when + or - is selected in the button
		document.querySelector(DOM.inputType).addEventListener('change', UIctrl.changedType);

	};


	var updateBudget = function() {
		// calculate the budget
		budgetCtrl.calculateBudget();

		// return the budget
		var budget = budgetCtrl.getBudget();

		// display the budget on the UI...
		UIctrl.displayBudget(budget);
	};


	var updatePercentages = function() {

		//1 calculate the 
		budgetCtrl.calculatePercentages();

		//2 read percentages from the budget controller
		var percentages = budgetCtrl.getPercentages();

		//3 update the UI with the new percentages
		UIctrl.displayPercentages(percentages);
	};


	var ctrlAddItem = function() {
		var input, newItem;

		// 1. get the field input data
		input = UIctrl.getInput();
		
		//make sure the fields arent empty
		if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
			//2. add the item to the budget controller
			newItem = budgetCtrl.addItem(input.type, input.description, input.value);

			//3. add item to the UI
			UIctrl.addListItem(newItem, input.type);

			//4. clear the fields
			UIctrl.clearFields();

			// 5. calculate and update budget
			updateBudget();

			//6. calculate and update the percentages
			updatePercentages();
		}			
	};


	var ctrlDeleteItem = function(event) {
		var itemID, splitID, type, ID;
		//to retrieve/traverse the parent node from the html file. .id gives the id of that node
		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
		
		if(itemID) {

			//inc-1
			splitID = itemID.split('-');
			type = splitID[0];
			ID = parseInt(splitID[1]);

			//1. delete the item from the data structure
			budgetCtrl.deleteItem(type, ID);

			//2. delete the item from the UI
			UIctrl.deleteListItem(itemID);

			//3 update and show the new budget	
			updateBudget();	
			//4 calculate and update the percentages
			updatePercentages();
		}
	};


	return {
		init: function() {
			console.log('application has started.');
			UIctrl.displayMonth();
			setUpEventListener();
			UIctrl.displayBudget({
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: -1
				});
		}
	};

	
})(budgetController, UIcontroller);


controller.init();
























