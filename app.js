const express = require("express");
const mongoose = require("mongoose");
const http = require('http');
const userModel = require("./model/transaction");
const app = express();
const cors = require("cors");
const fileUpload = require('express-fileupload');
const log = require('./utils/logger.js');
const conf = require('./utils/conf.js');
const { jsPDF } = require("jspdf");
const PDFDocument = require('pdfkit');
const fs = require('fs');
const readline = require('readline');
app.use(express.json());
app.use(cors());
app.use(fileUpload());


conf.appName = 'PDF backend';
conf.version = '1.0.0';
conf.LMD = '2022-07-22';
console.log(conf.appName + ', ' + conf.version + ', ' + conf.LMD);
if (process.argv.includes('-v')) {
  return
}


const removeEmptyLines = str => str.split(/\r?\n/).filter(line => line.trim() !== '').join('\n');



// Pipe its output somewhere, like to a file or HTTP response
// See below for browser usage

// Embed a font, set the font size, and render some text


// mongoose.connect('mongodb://localhost:27017/mongodb',
//   {
//     useNewUrlParser: true, useUnifiedTopology: true
//   }
// );

// const db = mongoose.connection;
// db.on("error", console.error.bind(console, "connection error: "));
// db.once("open", function () {
//   console.log("Connected successfully");
// });

// ESConn.checkConnectionInterval();

function generateHeader(doc) {
  doc.image('carlogo.png', 50, 45, { width: 50 })
    .fillColor('#444444')
    .fontSize(20)
    .text('U2Systmes SDN BHD.', 110, 57)
    .fontSize(10)
    .text(`No. 1040, Block A3,
    Leisure Commerce Square,
    No. 9 Jalan PJS8/9,
    46150 Petaling Jaya,
    Selangor, Malaysia`, 200, 65, { align: 'right' })
    .moveDown()
  // .underline(30, 0, 780, 140, { color: 'black' })
}

function generateTableRow(
  doc,
  y,
  item,
  description,
  unitCost,
  quantity,
  lineTotal
) {
  doc
    .fontSize(10)
    .text(item, 50, y)
    .text(description, 150, y)
    // .text(unitCost, 280, y, { width: 90, align: "right" })
    .text(quantity, 370, y, { width: 90, align: "right" })
  // .text(lineTotal, 0, y, { align: "right" });
}

function generateInvoiceTable(doc, invoice) {

  let i;
  const invoiceTableTop = 330;

  // console.log(invoice.split(/\r?\n/))
  // invoice.forEach(a1=>{
  //   console.log(a1)
  // })

  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    invoiceTableTop,
    "Item",
    "Description",
    "Unit Cost",
    "Detail",
    "Line Total"
  );
  generateHr(doc, invoiceTableTop + 20);
  doc.font("Helvetica");

  // removeEmptyLines(invoice)
  const result = removeEmptyLines(invoice).split(/\r?\n/)

  for (i = 0; i < result.length; i++) {
    const item = result[i];
    const position = invoiceTableTop + (i + 1) * 30;
    generateTableRow(
      doc,
      position,
      i,
      'None',
      'formatCurrency(item.amount / item.quantity)',
      result[i],
      ' formatCurrency(item.amount)'
    );

    generateHr(doc, position + 20);
  }

}




function generateCustomerInformation(doc) {
  // const shipping = invoice.shipping;

  doc
    .fillColor("#444444")
    .fontSize(20)
    .text("Report", 50, 160);

  generateHr(doc, 185);

  const customerInformationTop = 200;
  doc
    .fontSize(10)
    .text("Report ID:", 50, customerInformationTop)
    .font("Helvetica-Bold")
    .text(`${'A0891021'}`, 150, customerInformationTop)
    .font("Helvetica")
    .text("Report Date:", 50, customerInformationTop + 15)
    .text(formatDate(new Date()), 150, customerInformationTop + 15)
    .text("Summary:", 50, customerInformationTop + 30)
    .text(
      'Normal',
      150,
      customerInformationTop + 30
    )

    .font("Helvetica-Bold")
    .text('Max', 300, customerInformationTop)
    .font("Helvetica")
    .text('Home', 300, customerInformationTop + 15)
    .text(
      'Taiping' +
      ", " +
      'Perak ' +
      ", " +
      'Malaysia',
      300,
      customerInformationTop + 30
    )
    .moveDown();

  generateHr(doc, 252);
}

function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return year + "/" + month + "/" + day;
}

function generateHr(doc, y) {
  doc
    .strokeColor("#aaaaaa")
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(550, y)
    .stroke();
}

function generateFooter(doc) {
  doc
    .fontSize(10)
    .text(
      `This Report was generated on ${formatDate(new Date())}.`,
      50,
      780,
      { align: "center", width: 500 }
    );
}


app.post("/pdf", async (request, response) => {
  console.log(request.files)
  if (!request.files || Object.keys(request.files).length === 0) {
    response.status(400).send('No files were uploaded.');
  }

  // try {
  let sampleFile = request.files.file;
  var pdfDoc = new PDFDocument({ size: 'A4', margin: 50 });
  generateHeader(pdfDoc);
  generateCustomerInformation(pdfDoc)
  pdfDoc.pipe(fs.createWriteStream('text_alignment.pdf'));
  var struct = pdfDoc.struct('Document');
  pdfDoc.addStructure(struct);

  // var wrappedSection = pdfDoc.struct('Sect');
  // struct.add(wrappedSection)

  // pdfDoc.text(removeEmptyLines(sampleFile.data.toString('utf8')), {
  //   width: 412,
  //   align: 'left',
  //   // indent: 30,
  //   // paragraphGap: 5,
  //   structParent: wrappedSection
  // });


  generateInvoiceTable(pdfDoc, sampleFile.data.toString('utf8'))
  // pdfDoc.file(Buffer.from(sampleFile.data, 'utf8'), { name: 'huaweiPass.txt' })
  // pdfDoc.image('carlogo.png', 430, 15, { fit: [100, 100], align: 'center', valign: 'center' })
  //   .rect(430, 15, 100, 100).stroke()
  //   .text('Centered', 430, 0);
  // pdfDoc.text("This text is left aligned", { align: 'left' })
  // pdfDoc.text(removeEmptyLines(sampleFile.data.toString('utf8')), { align: 'left' })
  // pdfDoc.text("This text is at the center", { align: 'center' })
  // pdfDoc.text("This text is right aligned", { align: 'right' })
  // pdfDoc.text("This text needs to be slightly longer so that we can see that justification actually works as intended", { align: 'justify' })
  generateFooter(pdfDoc)


  pdfDoc.pipe(response)
  pdfDoc.end();
  // } catch (e) {
  //   response.send('No files were uploaded.');
  // }
});


app.listen(3005, () => {
  console.log("Server is running at port 3005");
});