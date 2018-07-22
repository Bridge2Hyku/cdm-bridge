import * as stringify from 'csv-stringify';

export async function csvString(data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const csv: stringify.Stringifier = stringify({ delimiter: ',' })
    let csvData: string = ''

    csv.on('readable', () => {
      let row: any
      while (row = csv.read()) {
        csvData += row
      }
    }).on('finish', () => {
      resolve(csvData)
    }).on('error', (err) => {
      reject(err)
    })

    data.map((row: any) => csv.write(row))
    csv.end()
  })
} 