# Invoice

Template to generate HTML/PDF invoices.

Based on: https://github.com/sparksuite/simple-html-invoice-template.

## Usage

```bash
$ node build.js -l en -c config-project.json invoice.html
```

## Tools

Additional accounting tools are available via separate NodeJS scripts:

- __Sum invoice totals__:
    ```bash
    node tools/invoice-sum config1.json [config2.json [...]]
    ```
    Examples:
    - Add quarterly income:
        ```bash
        $ node tools/invoice-sum path/to/invoices/2021-Q1/*/config-project.json
        { USD: 18500 }
        ```
    - Add yearly income:
        ```bash
        $ node tools/invoice-sum path/to/invoices/2021-*/*/config-project.json
        { USD: 74000, EUR: 8000 }
        ```
- __Identify unique entities__:
    ```bash
    $ node tools/invoice-entities config1.json [config2.json [...]]
    ```
    Examples:
    - Get all used entities:
        ```bash
        $ node tools/invoice-entities path/to/invoices/**/*.json
        [ { name: 'Aperture Science, Inc.',
            address: 'Brevort Lake Rd 1234',
            zip: '49760',
            city: 'Allenville',
            state: 'Michigan',
            country: 'us' } ]
        ```
- __Identify unique clients__:
    ```bash
    $ node tools/invoice-clients config1.json [config2.json [...]]
    ```
    Examples:
    - Get all known clients:
        ```bash
        $ node tools/invoice-clients path/to/invoices/**/*.json
        [ { name: 'Umbrella Corp.',
            address: '123 Queen Victoria St',
            zip: 'EC4N',
            city: 'London',
            country: 'gb' },
          { name: 'Sherlock Holmes',
            address: '221B Baker St',
            zip: 'NW16XE',
            city: 'London',
            country: 'gb' } ]
        ```