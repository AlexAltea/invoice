/* Utilities */
function absolute(base, relative) {
    if (relative[0] == "/") {
        base = "";
    }
    var stack = base.split("/");
    var parts = relative.split("/");
    stack.pop();
    for (var i = 0; i < parts.length; i++) {
        if (parts[i] == ".")
            continue;
        if (parts[i] == "..")
            stack.pop();
        else
            stack.push(parts[i]);
    }
    return stack.join("/");
}

/* Localization */
var language = {};

function loadLanguage(lang) {
    var path = "languages/" + lang + ".json";
    var request = new XMLHttpRequest();
    request.overrideMimeType("application/json");
    request.open('GET', path, false);
    request.send(null);
    if (request.status != 200) {
        console.error("Could not load language file: " + path);
        return;
    }
    var response = JSON.parse(request.responseText);
    console.assert(response.locale == lang);
    language = response;
}

function translate(string) {
    return language.strings.messages[string];
}

/* Formatting */
function fmtString(string) {
    const norm = language.strings.normalization;
    for (let [oldChar, newChar] of Object.entries(norm)) {
        string = string.replace(oldChar, newChar);
    }
    return string;
}

function fmtCareof(name) {
    if (typeof name !== "undefined") {
        const prefix = language.strings.messages.co;
        return prefix + ' ' + fmtString(name) + '<br>';
    }
    return '';
}

function fmtLocation(zip, town, state) {
    var result = town;
    if (typeof state !== "undefined") {
        result += `, ${state}`;
    }
    if (typeof zip !== "undefined") {
        result += ` ${zip}`;
    }
    return fmtString(result);
}

function fmtCountry(countryCode) {
    countryCode = countryCode.toUpperCase();
    country = language.strings.countries[countryCode];
    if (typeof country === "undefined") {
        console.error(`Country code '${countryCode}' not registered`);
        country = "";
    }
    return fmtString(country);
}

function fmtCurrency(amount, currency) {
    const fractionDigits = 2;
    var result = amount.toLocaleString(language.locale, {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
    });
    result += ` ${currency}`;
    return result;
}

function fmtExchange(amount) {
    const fractionDigits = 6;
    return amount.toLocaleString(language.locale, {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
    });
}

/* Configuration */
function loadConfiguration(path) {
    var config = {};
    var loaded = [];
    while (path) {
        if (loaded.includes(path)) {
            console.error("Configuration file already processed: " + path);
            break;
        }
        loaded.push(path);
        var request = new XMLHttpRequest();
        request.overrideMimeType("application/json");
        request.open('GET', path, false);
        request.send(null);
        if (request.status != 200) {
            console.error("Could not load configuration file: " + path);
            break;
        }
        var response = JSON.parse(request.responseText);
        config = Object.assign({}, config, response);
        var newpath = response.parent;
        if (typeof newpath === "undefined") {
            break;
        }
        path = absolute(path, newpath);
    }
    return config;
}

function addExtra(selector, field) {
    if (typeof field !== "undefined") {
        const elements = document.querySelectorAll(selector)
        for (let e of elements) {
            e.innerHTML += '<span>' + field + '</span><br>';
        }
    }
}

function setHtml(selector, html) {
    const elements = document.querySelectorAll(selector);
    for (let e of elements) {
        e.innerHTML = html;
    }
}

function applyConfiguration(config) {
    setHtml('#company-name',
        fmtString(config.company.name));
    setHtml('#company-address',
        fmtString(config.company.address));
    setHtml('#company-town',
        fmtLocation(config.company.zip, config.company.city, config.company.state));
    setHtml('#company-country',
        fmtCountry(config.company.country));
    addExtra('.information-company', config.company.email);
    addExtra('.information-company', config.company.vatId);

    setHtml('#client-name',
        fmtString(config.client.name));
    setHtml('#client-co',
        fmtCareof(config.client.co));
    setHtml('#client-address',
        fmtString(config.client.address));
    setHtml('#client-town',
        fmtLocation(config.client.zip, config.client.city, config.client.state));
    setHtml('#client-country',
        fmtCountry(config.client.country));
    addExtra('.information-client', config.client.email);
    addExtra('.information-client', config.client.vatId);

    setHtml('.invoice-id',
        fmtString(config.invoice.id));
    setHtml('.invoice-created',
        fmtString(config.invoice.created));
    setHtml('.invoice-due',
        fmtString(config.invoice.due));

    setHtml('.payment-method',
        translate(config.payment.method));
    if (config.payment.method == "wire") {
        setHtml('.payment-details',
            'IBAN: ' + config.payment.iban);
    }

    var total = 0;
    for (var i = 0; i < config.projects.length; i++) {
        var project = config.projects[i];
        var price = fmtCurrency(project.amount, config.currencySrc);
        var code = '<tr class="item">';
        code += '<td>' + project.name + '</td>';
        code += '<td>' + price + '</td>';
        code += '</tr>';
        document.querySelector('.invoice-items tbody').innerHTML += code;
        total += project.amount;
    }

    setHtml('.invoice-summary .invoice-total',
        'Total: ' + fmtCurrency(total, config.currencySrc));

    if (config.currencySrc != config.currencyDest) {
        if (typeof config.currencyExchange === "undefined") {
            config.currencyExchange = 1.0 / config.currencyExchangeInv;
        }
        var amountFinal = total * config.currencyExchange;
        setHtml('.invoice-summary .invoice-final',
            '*Total: ' + fmtCurrency(amountFinal, config.currencyDest));
        setHtml('.invoice-summary .invoice-exchange',
            `${translate('exchange-rate')} ${config.currencyDest}/${config.currencySrc}
             ${translate('on-day')} ${config.invoice.created}:
             ${fmtExchange(config.currencyExchange)}`);
    }
}

function applyTranslation() {
    for (var key in language.strings.messages) {
        var selector = '.t-' + key;
        setHtml(selector, translate(key));
    }
}

function main() {
    var config = loadConfiguration('config-temp.json');
    loadLanguage(config.language);
    applyConfiguration(config);
    applyTranslation();
}

main();
