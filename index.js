const { default: Axios } = require('axios');
const cfonts = require('cfonts');
const rs = require('readline-sync');

async function start() { 
    cfonts.say('CEK NO|REKENING', {
        font: 'block',              // define the font face.
        align: 'center',              // define text alignment.
        colors: ['red','blue'],         // define all colors.
        background: 'transparent',  // define the background color, you can also use `backgroundColor` here as key.
        letterSpacing: 1,           // define letter spacing.
        lineHeight: 1,              // define the line height.
        space: true,                // define if the output text should have empty lines on top and on the bottom.
        maxLength: '0',             // define how many character can be on one line.
        gradient: false,            // define your two gradient colors.
        independentGradient: false, // define if you want to recalculate the gradient for each new line.
        transitionGradient: false,  // define if this is a transition between colors directly.
        env: 'node'                 // define the environment cfonts is being executed in.
    });
    console.log("================================")
    console.log("CREATOR : TOBZ")
    console.log("================================")
    console.log(" ")
    const list_pilihan = ["Cek ID Bank","Cek Laporan Bank"]
    const pilihan = rs.keyInSelect(list_pilihan, "Select : ")
    if (pilihan == "0") {
        await list_bank()
    } else if (pilihan == "1") {
        await cek_rekening()
    }
}

async function list_bank() {
    Axios("https://cekrekening.id/master/bank?enablePage=0&bankName=", { method: "GET" })
    .then(async (result) => {
        for (let i in result.data.data.content) {
            console.log(
`~> Bank ID : ${Number(i) + 1}
~> Bank Name : ${result.data.data.content[i].bankName}
`); 
        }
    })
    .then(async () => {
        const list_pilihan = ["Menu Utama","Cek Laporan Bank"]
        const pilihan = rs.keyInSelect(list_pilihan, "Select : ")
        if (pilihan == "0") {
            await start()
        } else if (pilihan == "1") {
            await cek_rekening()
        }
    }).catch((e) => console.log(e));
}

async function cek_id(bank_id) {
    return new Promise((resolve, reject) => {
        Axios("https://cekrekening.id/master/bank?enablePage=0&bankName=", { method: "GET" })
        .then(async (result) => {
            const bankID = []
            for (let i in result.data.data.content) {
                bankID.push(result.data.data.content[i].id)
            }
            if (bankID.includes(bank_id)) {
                console.log("[ x ] ID BANK TIDAK DITEMUKAN!")
                cek_rekening()
            }
            const bankName = result.data.data.content[bank_id - 1].bankName
            resolve({
                status: true,
                name: bankName
            })
        }).catch((e) => console.log(e));
    })
}

async function cek_rekening() {
    const bank_id = rs.question("[ ! ] Input Bank ID : ");
    const cek_bank_id = await cek_id(bank_id);
    if (bank_id.length === 0) {
        console.log("[ x ] MASUKAN ID BANK!")
    }
    if (!Number(bank_id)) {
        console.log("[ x ] MASUKAN ID BANK DENGAN BENAR!")
    }
    if (cek_bank_id.status === false) {
       console.log("[ x ] ID BANK TIDAK DITEMUKAN!")
    }
    console.log("[ + ] Kamu memilih bank " + cek_bank_id.name + " dengan ID " + bank_id)
    const bank_number = rs.question("[ ! ] Input Bank Number : ");
    Axios("https://cekrekening.id/master/cekrekening/report", {
        method: "POST",
        data: {
            "bankId": bank_id, 
            "bankAccountNumber": bank_number
        }
    }).then(async ({ data }) => {
        if (data.status === false) {
            console.log(`
[ + ] NOMOR REKENING INI BELUM PERNAH DILAPORKAN TERKAIT TINDAK PENIPUAN APAPUN!
`)
            const list_pilihan = ["Kembali Ke Menu Utama", "Kembali Cek Laporan Bank"]
            const pilihan = rs.keyInSelect(list_pilihan, "Select : ")
            if (pilihan == "0") {
                start()
            } else if (pilihan == "1") {
                cek_rekening()
            }
        } else if (data.status === true) {
            console.log(`
[ + ] NOMOR REKENING DITEMUKAN!

=================================

•> ID Bank : ${data.data.laporan.bank.id}
•> Nama Bank : ${data.data.laporan.bank.bankName}
•> Nomor Rekening : ${data.data.laporan.accountNo}
•> Nama Rekening : ${data.data.laporan.accountName}

=================================`)
            for (let i = 0; i < data.data.laporanDetail.length; i++) {
                console.log(`
•> Laporan Detail : 
  - Pelapor : ${data.data.laporanDetail[i].verificator.fullname}
  - Email Pelapor : ${data.data.laporanDetail[i].verificator.email}
  - Tanggal Dibuat : ${new Date(data.data.laporanDetail[i].laporanDate).toLocaleDateString('id')}
  - Kronologi : ${data.data.laporanDetail[i].chronology}
  - Kerugian : ${data.data.laporanDetail[i].totalLoss}
  - Nama Tersangka : ${data.data.laporanDetail[i].suspectName}
  - Status : ${data.data.laporanDetail[i].status.description}
  - Kategori Aduan : 
    ~ Deskripsi : ${data.data.laporanDetail[i].kategoriAduan.deskripsi}
    ~ Keterangan : ${data.data.laporanDetail[i].kategoriAduan.keterangan}
  - Kota : ${data.data.laporanDetail[i].kota.name}
  - Sumber Media : 
    ~ Deskripsi : ${data.data.laporanDetail[i].sumberMedia.description}
    ~ Informasi : ${data.data.laporanDetail[i].sumberMedia.information}

=================================`)
            }
            const list_pilihan = ["Kembali Ke Menu Utama","Kembali Cek Laporan Bank"]
            const pilihan = rs.keyInSelect(list_pilihan, "Select : ")
            if (pilihan == "0") {
                start()
            } else if (pilihan == "1") {
                cek_rekening()
            }
        }
    }).catch((e) => console.log(e))
}

async function delay (ms) {
	return new Promise((resolve, reject) => setTimeout(resolve, ms))
}

start()
