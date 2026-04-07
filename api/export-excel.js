const XLSX = require('xlsx');

export default function handler(req, res) {
    const { data: dataStr, filename = 'export.xlsx' } = req.query;

    if (!dataStr) {
        return res.status(400).send('No data provided');
    }

    let data;
    try {
        data = JSON.parse(decodeURIComponent(dataStr));
    } catch (e) {
        return res.status(400).send('Invalid data');
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-store');
    res.send(buffer);
}