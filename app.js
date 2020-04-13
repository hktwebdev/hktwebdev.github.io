// Budget Controller 
budgetController = (function () {
    // Expense
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value/totalIncome) * 100);
        }else{
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }

    // Income
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    calculateTotal = function (type) {
            var sum = 0;

            data.allItems[type].forEach(function (cur) {
                sum += cur.value;
            });
            data.totals[type] = sum;
        }
        // Data
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
    }

    return {
        addItem: function (type, des, val) {
            var ID, newItem;

            // creating new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            // create new item based on 'exp' or 'inc' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // push  item to data structure 
            data.allItems[type].push(newItem);

            //return new element
            return newItem;
        },
        testing: function(){
            return console.log(data.allItems);
        },

        calculateBudget: function () {

            // calculate total income and budget
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate the budget: income - expenses

            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }

        },
        calculatePercentages: function(){

            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });

        },

        getPercentages: function(){
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        deleteItem: function(type, id){
            var ids, index;

              ids = data.allItems[type].map(function(current){
                return current.id;
            });
            
            index = ids.indexOf(id);

            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }
        }

    }

})();

// UI Controller
var UIcontroller = (function () {

    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        clickAddBtn: '.add__btn',
        expensesContainer: '.expenses__list',
        incomeContainer: '.income__list',
        budegetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'

    }
    var formatNumber = function(num, type){
        var numSplit, int, dec, type;
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');
        int = numSplit[0];
        if(int.length > 3){
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };
    var nodeListForEach = function(list, callback){
        for(var i =0; i<list.length; i++){
            callback(list[i], i);
        }
    };
    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },

        getDOMStrings: function () {
            return DOMStrings;

        },

        displayMonth: function(){
            var now, year, month, months;
            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            year = now.getFullYear();
            month = now.getMonth();
            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        addListItem: function (obj, type) {
            var html, newHtml, element;
            // create HTML string with place holder text
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>'
            } else if (type === 'exp') {
                element = DOMStrings.expensesContainer;
                html = ' <div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div></div>'
            }

            // replace the place holder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorID){
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function () {
            var fields, fieldArr;

            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
            fieldArr = Array.prototype.slice.call(fields);

            fieldArr.forEach(function (current, index, array) {
                current.value = '';
                console.log(index, array);
            });
            fieldArr[0].focus();
        },
        displayBudget: function (obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMStrings.budegetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '--';
            }

        },

        displayPercentages: function(percentages){
            var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);

            nodeListForEach(fields, function(current, index){
                if(percentages[index] > 0){ 
                    current.textContent = percentages[index] + '%';
                }else{
                    current.textContent = '---';
                }
            });
        },

        changedType: function(){
            var fileds = document.querySelectorAll(
                DOMStrings.inputType + ',' + 
                DOMStrings.inputDescription + ',' + 
                DOMStrings.inputValue 
            );
            document.querySelector(DOMStrings.clickAddBtn).classList.toggle('red');
            nodeListForEach(fileds, function(cur){
                cur.classList.toggle('red-focus');
            });
        }
    }
})();


// Controller
var controller = (function (budgetCntrl, UICntrl) {

    var setupEventListeners = function () {
        var DOM = UICntrl.getDOMStrings();

        // On click of add item button
        document.querySelector(DOM.clickAddBtn).addEventListener('click', ctrlAddItem);

        // On press enter button
        document.addEventListener('keypress', function (event) {

            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        // Delete exp or inc item
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        // Change color on input fields
        document.querySelector(DOM.inputType).addEventListener('change', UICntrl.changedType);
    }
    var updateBudget = function () {

        // 1. Calculate the budget
        budgetCntrl.calculateBudget();

        // 2. return the budget

        var budget = budgetCntrl.getBudget();

        // 3. Display the budget on the UI
        UICntrl.displayBudget(budget);
    };

    var updatePercentages = function(){
        
        // calculate percentages
        budgetCntrl.calculatePercentages();

        // read the percentages from the budget controller
        var percentages = budgetCntrl.getPercentages();

        // update the UI with the new percentages
        UICntrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function () {
        var input, newItem;
        // 1. Get the field input data
        input = UICntrl.getInput();

        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {

            // 2. Add the item to budget controller
            newItem = budgetCntrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            UICntrl.addListItem(newItem, input.type);

            // 4. clear input fields after adding
            UICntrl.clearFields();

            // 5. Calculate and update the budget
            updateBudget();

            // calculate and update percentages
            updatePercentages();
        }


    }
var ctrlDeleteItem = function(event){
    var itemID, splitID, type, ID;
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    console.log(itemID);
    if(itemID){
        splitID = itemID.split('-');
        type = splitID[0];
        ID = parseInt(splitID[1]);
    }
    // delete the item from the data structure
    budgetCntrl.deleteItem(type, ID);
    budgetController.testing();

    // delete the item from the UI
    UICntrl.deleteListItem(itemID);

    // update and show the new budget
    updateBudget();

    // calculate and update percentages
    updatePercentages();
}
    return {
        init: function () {
            console.log('Application has started.');
            UICntrl.displayMonth();
            UICntrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }

})(budgetController, UIcontroller);

controller.init();