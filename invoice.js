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
        config = $.extend(true, {}, config, response);
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
        $(selector).append(
            '<span>' + field + '</span><br>'
        )
    }
}

function applyConfiguration(config) {
    $('#company-name').html(
        fmtString(config.company.name));
    $('#company-address').html(
        fmtString(config.company.address));
    $('#company-town').html(
        fmtLocation(config.company.zip, config.company.city, config.company.state));
    $('#company-country').html(
        fmtCountry(config.company.country));
    addExtra('.information-company', config.company.email);
    addExtra('.information-company', config.company.vatId);
    
    $('#client-name').html(
        fmtString(config.client.name));
    $('#client-address').html(
        fmtString(config.client.address));
    $('#client-town').html(
        fmtLocation(config.client.zip, config.client.city, config.client.state));
    $('#client-country').html(
        fmtCountry(config.client.country));
    addExtra('.information-client', config.client.email);
    addExtra('.information-client', config.client.vatId);

    $('.invoice-id').html(
        fmtString(config.invoice.id));
    $('.invoice-created').html(
        fmtString(config.invoice.created));
    $('.invoice-due').html(
        fmtString(config.invoice.due));

    $('.payment-method').html(
        translate(config.invoice.paymentMethod));
    if (config.invoice.paymentMethod == "wire") {
        $('.payment-details').append('IBAN: ' + config.invoice.iban);
    }

    var total = 0;
    for (var i = 0; i < config.projects.length; i++) {
        var project = config.projects[i];
        var price = fmtCurrency(project.amount, config.currencySrc);
        var code = '<tr class="item">';
        code += '<td>' + project.name + '</td>';
        code += '<td>' + price + '</td>';
        code += '</tr>';
        $('.invoice-items tr:last').after(code);
        total += project.amount;
    }

    $('.invoice-summary .invoice-total').html(
        'Total: ' + fmtCurrency(total, config.currencySrc));

    if (config.currencySrc != config.currencyDest) {
        if (typeof config.currencyExchange === "undefined") {
            config.currencyExchange = 1.0 / config.currencyExchangeInv;
        }
        var amountFinal = total * config.currencyExchange;
        $('.invoice-summary .invoice-final').html(
            '*Total: ' + fmtCurrency(amountFinal, config.currencyDest));
        $('.invoice-summary .invoice-exchange').html(
            `${translate('exchange-rate')} ${config.currencyDest}/${config.currencySrc}
             ${translate('on-day')} ${config.invoice.created}:
             ${fmtExchange(config.currencyExchange)}`);
    }
}

function applyTranslation() {
    for (var key in language.strings.messages) {
        var className = '.t-' + key;
        $(className).html(translate(key));
    }
}

function main() {
    var config = loadConfiguration('config-temp.json');
    loadLanguage(config.language);
    applyConfiguration(config);
    applyTranslation();
}

main();
