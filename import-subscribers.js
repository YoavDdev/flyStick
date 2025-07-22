// Bulk import script for Studio Boaz subscribers
const axios = require('axios');

// Extracted email addresses from the provided subscriber list
const subscriberEmails = [
  'uriahhoresh3@gmail.com',
  'noirozi@gmail.com',
  'ilaneden@gmail.com',
  'michalmazouz@gmail.com',
  'bacharuria@gmail.com',
  'efratlevinpilates@gmail.com',
  'hoffm1michal@gmail.com',
  'dalia60602@icloud.com',
  'zamit1@hotmail.com',
  'studkeren@gmail.com',
  'hilaohali@yahoo.com',
  'cohenshirley@yahoo.com',
  'sharon.goldblatt1@gmail.com',
  'arbel.zaidel@gmail.com',
  'rachelgaloni@gmail.com',
  'zohar.asher1@gmail.com',
  'goofna.merav@gmail.com',
  'adigastudio22@gmail.com',
  'netakim@gmail.com',
  'indyk.nurit@gmail.com',
  'shira412@gmail.com',
  'michallife@gmail.com',
  'laxliat@gmail.com',
  'arnon.friedman@gmail.com',
  'hebadaksa@gmail.com',
  'yljorden@gmail.com',
  'shoty2321@gmail.com',
  'annabranovski1@gmail.com',
  'saar@falkor.pro',
  'evej88@gmail.com',
  'nirdyoz@gmail.com',
  'carmitam3@gmail.com',
  'ofiraporat@gmail.com',
  'lea.gin3@gmail.com',
  'pazmi92@gmail.com',
  'mayabelleli@gmail.com',
  'shamaimiri@gmail.com',
  'eyalz111@gmail.com',
  'relaxedinside@gmail.com',
  'yoav.dra@gmail.com',
  'devaneerja@gmail.com',
  'deva.asch@me.com',
  'guralnikn@gmail.com',
  'gefenbe@gmail.com',
  'shirezer811@gmail.com',
  'saraistrauss1312@gmail.com',
  'lioramit77@gmail.com',
  'farbero@gmail.com',
  'harifffstream@gmail.com',
  'yoavd.dev@gmail.com',
  'tamar.move@gmail.com',
  'ronimissuk.rm@gmail.com',
  'roni.guper@gmail.com',
  'inbal_siton@walla.com',
  'kerenalon100@gmail.com',
  'bellabaroz1@gmail.com',
  'ymilo9@zahav.net.il',
  'sharon.pewzner@gmail.com',
  'danasasson3@gmail.com',
  'saharosadeh@gmail.com',
  'jen.acrobatic.dancer@gmail.com',
  'dorilitvak@gmail.com',
  'e@z99.co',
  'yaelzerony@gmail.com',
  'asherig@walla.co.il',
  'orit.hashay@gmail.com',
  'revitalperry75@gmail.com',
  'eliorzn@gmail.com',
  'alexsandraobshatko@gmail.com',
  'morananavim@gmail.com',
  'hila@park.co.il',
  'dalia6356@gmail.com',
  'anafa.carmeli@gmail.com',
  'yaelsverdloff.school@gmail.com',
  'aquatherapy@gmail.com',
  'zoeparan@gmail.com',
  'sivanelkes@gmail.com',
  'advacha1@gmail.com',
  'ronit-me@bezeqint.net',
  'korona71@gmail.com',
  'liya.donchin@gmail.com',
  'mayat7@gmail.com',
  'nrn911@gmail.com',
  'maliaviv09@gmail.com',
  'netashaier@gmail.com',
  'mormenachem11@gmail.com',
  'nealelefant@gmail.com',
  'natalieginatlevy@gmail.com',
  'thepfcode@gmail.com',
  'yoavddev@gmail.com',
  'dronny2202@gmail.com',
  'avivmerzan@gmail.com',
  'anatp3103@gmail.com',
  'maya@t-and-i.co.il',
  'ronzina@gmail.com',
  'chnraz@gmail.com',
  'roni@israeli-tents.com',
  'orlyfsimhony@gmail.com',
  'duzielferuz@gmail.com',
  'rutiziv99@gmail.com',
  'keren.aaronsohn@gmail.com',
  'guyzdb@gmail.com',
  'yanarosental12@gmail.com',
  'nsbanjo@gmail.com',
  'yaaralevin1@gmail.com',
  'hama1987@gmail.com',
  'carmit.scetbon@gmail.com',
  'apeleg6@gmail.com',
  'yaelhco@gmail.com',
  'tsufyifrah1@gmail.com',
  'galiawolff8@gmail.com',
  'ronit@copeland.co.il',
  'yaelepel0406@gmail.com',
  'judposner@walla.com',
  'yarden.zuarets@gmail.com',
  'akrabiora@hotmail.com',
  'yulia.blous@gmail.com',
  'millrshirly@gmail.com',
  'shir9550@gmail.com',
  'liororen1986@gmail.com',
  'tamar.freudenheim@gmail.com',
  'eshoof@gmail.com',
  'nitz_am@ashdot-m.org.il',
  'taliakonkol@gmail.com',
  'diklarabi@walla.com',
  'dana.biechonski@gmail.com',
  'noamika@gmail.com',
  'yamitben@gmail.com',
  'danagutman87@gmail.com',
  'dance.yael@gmail.com',
  'zzaaoobb@gmail.com',
  'yoavdra@gmail.com'
];

async function importSubscribers() {
  try {
    console.log(`Starting import of ${subscriberEmails.length} subscribers...`);
    
    const response = await axios.post('http://localhost:3000/api/bulk-import-subscribers', {
      emails: subscriberEmails
    });

    console.log('Import completed successfully!');
    console.log('Results:', response.data);
    
    if (response.data.results) {
      console.log(`\nSummary:`);
      console.log(`- Imported: ${response.data.results.imported}`);
      console.log(`- Skipped (already exists): ${response.data.results.skipped}`);
      console.log(`- Errors: ${response.data.results.errors}`);
    }

  } catch (error) {
    console.error('Import failed:', error.response?.data || error.message);
  }
}

// Run the import
importSubscribers();
