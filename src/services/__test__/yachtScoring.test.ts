import { launchBrowser } from '../../utils/puppeteerLauncher';
import yachtScoring from '../yachtScoring';

jest.mock('../../utils/puppeteerLauncher');

const mockLoginSuccessTableHtml = `<td align="center" colspan="4">
<b style="font-size: 14px">Yacht Scoring Administration</b>
<hr size="1" style="color: Navy" noshade="">
<b>Select the event you would like to work with:</b>
<br>(<i>If your Login is Inactive, please contact your Event Administrator</i>)
<hr size="1" style="color: Navy" noshade="">
</td>`;

const mockLoginSuccessWithEventsArray = [
  [
    '\n' +
      '\t<b style="font-size: 14px">Yacht Scoring Administration</b>\n' +
      '\t<hr size="1" style="color: Navy" noshade="">\n' +
      '\t<b>Select the event you would like to work with:</b>\n' +
      '\t<br>(<i>If your Login is Inactive, please contact your Event Administrator</i>)\n' +
      '\t<hr size="1" style="color: Navy" noshade="">\n' +
      '\t',
  ],
  [
    '<dd><b>Event Name</b></dd>',
    '<b>Event Date</b>',
    '<b>Event Status</b>',
    '<b>Login Status</b>',
  ],
  ['<hr size="1" style="color: Navy" noshade="">'],
  [
    '<dd><li><a href="./admin_main.cfm?Event_ID=12987">Spirit of Bermuda Charity Rally</a></li></dd>',
    '&nbsp; 06/Jul/2020 &nbsp;',
    '&nbsp; <i style="color: green">Active</i>&nbsp;',
    '&nbsp; <i style="color: green">Active</i>&nbsp;',
  ],
  [
    '\n' +
      '\t<hr size="1" style="color: Navy" noshade="">\n' +
      '\t<a href="./logout.cfm"><b>Logout</b></a>\n' +
      '\t',
  ],
];

const mockYachtTableArray = [
  [
    '\n' +
      '\t<b style="font-size: 14px">Spirit of Bermuda Charity Rally<br>Edit/Delete Current Entry</b>\n' +
      '\t<hr size="1" style="color: Navy" noshade="">\n' +
      '\t',
  ],
  [
    '',
    '<a href="./edit_yacht_list.cfm?ListOrder=id"><b>ID</b></a>',
    '',
    '<a href="./edit_yacht_list.cfm?ListOrder=circle"><b>Circle</b></a>',
    '<b>Division</b>',
    '<b>Class</b>',
    '<b>Alt Class</b>',
    '<a href="./edit_yacht_list.cfm?ListOrder=sail"><b>Sail Number</b></a>',
    '<a href="./edit_yacht_list.cfm?ListOrder=name"><b>Yacht Name</b></a>',
    `<a href="./edit_yacht_list.cfm?ListOrder=owner"><b>Owner's Name</b></a>`,
    '<a href="./edit_yacht_list.cfm?ListOrder=yacht"><b>Yacht Type</b></a>',
    '<b>Length</b>',
    '<a href="./edit_yacht_list.cfm?Event_ID=12987&amp;ListOrder=origin"><b>Origin</b></a>',
    '<b>Paid</b>',
    '',
  ],
  [
    '1.',
    '206307',
    '<a href="./edit_yacht_entry.cfm?Yacht_ID=206307">edit</a>',
    'North Start',
    'ORC',
    '1',
    'ORC',
    'USA 51235',
    'Avocation',
    'Henry Schmitt',
    'Swan 48',
    '48',
    'Halesite, NY, United States',
    '<b style="color: green">Yes</b>',
    `<a href="./delete_yacht_entry.cfm?Yacht_ID=206307" onclick="return(confirm('WARNING:\\n\\nThis process will completely delete all information on this yacht from this event in the database and cannot be undone.\\n\\nAre you sure you want to continue?'));">delete</a>`,
  ],
  [
    '2.',
    '206318',
    '<a href="./edit_yacht_entry.cfm?Yacht_ID=206318">edit</a>',
    'West Start',
    'ORC',
    '1',
    'ORC',
    'SWE 59011',
    'Icebear',
    'Andy Schell',
    'Swan 59',
    '59',
    'Leesport, PA, USA',
    '<b style="color: green">Yes</b>',
    `<a href="./delete_yacht_entry.cfm?Yacht_ID=206318" onclick="return(confirm('WARNING:\\n\\nThis process will completely delete all information on this yacht from this event in the database and cannot be undone.\\n\\nAre you sure you want to continue?'));">delete</a>`,
  ],
  [
    '3.',
    '206319',
    '<a href="./edit_yacht_entry.cfm?Yacht_ID=206319">edit</a>',
    'West Start',
    'ORC',
    '1',
    'ORC',
    'USA 14571',
    'Isbjorn',
    'Andy Schell',
    'Swan 48',
    '48',
    'Leesport, PA, USA',
    '<b style="color: green">Yes</b>',
    `<a href="./delete_yacht_entry.cfm?Yacht_ID=206319" onclick="return(confirm('WARNING:\\n\\nThis process will completely delete all information on this yacht from this event in the database and cannot be undone.\\n\\nAre you sure you want to continue?'));">delete</a>`,
  ],
  [
    '4.',
    '206299',
    '<a href="./edit_yacht_entry.cfm?Yacht_ID=206299">edit</a>',
    'North Start',
    'ORC',
    '1',
    'ORC',
    'USA 61216',
    'Luna',
    'Alessandro Pagani',
    'Spirit 47 Cr',
    '46.98',
    'Lexington, MA, USA',
    '<b style="color: green">Yes</b>',
    `<a href="./delete_yacht_entry.cfm?Yacht_ID=206299" onclick="return(confirm('WARNING:\\n\\nThis process will completely delete all information on this yacht from this event in the database and cannot be undone.\\n\\nAre you sure you want to continue?'));">delete</a>`,
  ],
  [
    '<hr size="1" style="color: Navy" noshade="">\n' +
      '\t<a href="./admin_main.cfm"><b>Main Menu</b></a>',
  ],
];

const mockCrewTableArray = [
  [
    '',
    '<b>Crew Name</b>',
    '<b>Crew Address</b>',
    '<b>Weight</b>',
    '<b>DOB</b>',
    '<b>Age</b>',
    '<b>Position</b>',
    '<b>WS/ISAF #</b>',
    '<b>Sailor Class.</b>',
    '<b>USSailing #</b>',
    '<b>Class Member</b>',
    '<b>Phone</b>',
    '<b>Cell</b>',
    '<b>Email</b>',
    '<b>Class<br>Approv.</b>',
    '<b>Waiver</b>',
  ],
  [
    '<b>Avocation - USA 51235 - Swan 48 - (Crew: </b><b style="color: red">6</b>)',
  ],
  [
    '<b>1.</b>',
    'Carl Forsander',
    '3010 17th St, Santa Monica, CA, USA',
    '190 Lbs',
    '05/May/1960',
    '61',
    '',
    '',
    'Group 1',
    '',
    '',
    '310-384-9289',
    '3103849289',
    '<a href="mailto:carlforsander@gmail.com">carlforsander@gmail.com</a>',
    '&nbsp;',
    '<img src="../images/check_blue.png" border="0">',
  ],
  [
    '<b>2.</b>',
    'Victor Fortino',
    '4115 North Limeball St, Buckeye, AZ , USA',
    '210 Lbs',
    '09/Jul/1970',
    '51',
    'Helm',
    '',
    'Group 1',
    '',
    '',
    '4806886508',
    '4806886508',
    '<a href="mailto:victorfortinoiii@gmail.com">victorfortinoiii@gmail.com</a>',
    '&nbsp;',
    '<img src="../images/check_blue.png" border="0">',
  ],
  [
    '<b>3.</b>',
    'Rob Goss',
    '260 Scenic Hills Rd, Kerrville, TX, USA',
    '180 Lbs',
    '19/Feb/1958',
    '63',
    '',
    '',
    'Group 1',
    '',
    '',
    '830-285-7618',
    '830-285-7618',
    '<a href="mailto:robgoss830@yahoo.com">robgoss830@yahoo.com</a>',
    '&nbsp;',
    '<img src="../images/check_blue.png" border="0">',
  ],
  [
    '<b>4.</b>',
    'Henry Schmitt',
    'PO Box 2600, Halesite, NY, USA',
    '200 Lbs',
    '26/Jul/1958',
    '63',
    '',
    '',
    'Group 1',
    'USA51235',
    '',
    '631-423-4988',
    '631-848-3112',
    '<a href="mailto:offshorepassage@sprintmail.com">offshorepassage@sprintmail.com</a>',
    '&nbsp;',
    '<img src="../images/check_blue.png" border="0">',
  ],
  [
    '<b>5.</b>',
    'Kayla Stone',
    '119A N Camp St, Windsor , PA, USA',
    ' ',
    '06/Jan/1990',
    '31',
    'Floater',
    '',
    'Group 1',
    '',
    '',
    '',
    '717-676-7736',
    '<a href="mailto:Kayraestone@gmail.com">Kayraestone@gmail.com</a>',
    '&nbsp;',
    '<img src="../images/check_blue.png" border="0">',
  ],
  [
    '<b>6.</b>',
    'William Tham',
    '789 Sonne Drive, Annapolis, MD, United States',
    '170 Lbs',
    '27/Jul/1959',
    '62',
    'Medic/Doctor',
    '',
    'Group 1',
    '',
    '',
    '4432716436',
    '4432716435',
    '<a href="mailto:billtham59@gmail.com">billtham59@gmail.com</a>',
    '&nbsp;',
    '<img src="../images/check_blue.png" border="0">',
  ],
  ['&nbsp;'],
  [
    '<b>Total Crew Weight:</b>&nbsp;&nbsp;&nbsp;<br><b>Note:</b> Weight added only when units are known (Lbs/Kg)&nbsp;&nbsp;&nbsp;',
    '\n\t<b> 950.00 Lbs<br> 431.0 Kg</b>\n\t',
    '<b>Avg. Age:</b> 55.2',
    '&nbsp;',
    '<b>Approve all Crew</b>\n' +
      `\t\t<input type="radio" id="Class_Y" name="Team_Approve" value="./crew_approve_all_crew.cfm?approve_all_crew=1&amp;yid=206307&amp;eid=12987" onclick="PopWindow(this.value,'ClassCrewMark_Y','800','450','yes')"> Yes\n` +
      `\t\t<input type="radio" id="Class_Y" name="Team_Approve" value="./crew_approve_all_crew.cfm?approve_all_crew=0&amp;yid=206307&amp;eid=12987" onclick="PopWindow(this.value,'ClassCrewMark_Y','800','450','yes')"> No\n` +
      '\t\t',
  ],
  ['<hr size="1" style="color: silver" noshade="">'],
  [''],
  [
    '<b>Icebear - SWE 59011 - Swan 59 - (Crew: </b><b style="color: red">8</b>)',
  ],
  [
    '<b>1.</b>',
    'James Butler',
    '4707 BRIAR PATCH LN, FAIRFAX, VA, United States',
    '175 Lbs',
    '26/Aug/1956',
    '65',
    'Helm',
    '',
    'Group 1',
    '',
    '',
    '7037642578',
    '7036272253',
    '<a href="mailto:CaptainJLB@aol.com">CaptainJLB@aol.com</a>',
    '&nbsp;',
    '<img src="../images/check_blue.png" border="0">',
  ],
  [
    '<b>2.</b>',
    'Brandon Figg',
    ', , , USA',
    '155 Lbs',
    '08/Nov/1989',
    '32',
    'Mast',
    '',
    '',
    '',
    '',
    '1 (502) 994-8308 ',
    '',
    '<a href="mailto:brandon.jay.figg@gmail.com">brandon.jay.figg@gmail.com</a>',
    '&nbsp;',
    '<img src="../images/x_red.png" border="0">',
  ],
  [
    '<b>3.</b>',
    'Emma Garschagen',
    '2 Lounsbury Rd, Croton on Hudson, NY, United States',
    '140 Lbs',
    '13/May/1997',
    '24',
    'Helm',
    '',
    '',
    '',
    '',
    '8452009574',
    '8452009574',
    '<a href="mailto:ehgarschagen@gmail.com">ehgarschagen@gmail.com</a>',
    '&nbsp;',
    '<img src="../images/x_red.png" border="0">',
  ],
  [
    '<b>4.</b>',
    'Henry Knecht',
    '1529 Massachusetts Ave. SE, Washington, District of Columbia, United States',
    '160 Lbs',
    '16/Oct/1993',
    '28',
    'Other',
    '',
    'Group 1',
    '',
    '',
    '9176084807',
    '',
    '<a href="mailto:hknecht@gwu.edu">hknecht@gwu.edu</a>',
    '&nbsp;',
    '<img src="../images/check_blue.png" border="0">',
  ],
  [
    '<b>5.</b>',
    'Martain Lackovic ',
    '5420 Newark Street, NW, Washinton, DC, USA',
    '200 Lbs',
    '28/Oct/1963',
    '58',
    'Chef',
    '',
    'Group 1',
    '',
    '',
    '3015293372',
    '3015293372',
    '<a href="mailto:mlackovic63@gmail.com">mlackovic63@gmail.com</a>',
    '&nbsp;',
    '<img src="../images/check_blue.png" border="0">',
  ],
  [
    '<b>6.</b>',
    'Zina Maker ',
    ', , , USA',
    '125 Lbs',
    '27/Dec/1989',
    '31',
    '',
    '',
    '',
    '',
    '',
    '1 (443) 791-6966',
    '',
    '<a href="mailto:zina.mak@gmail.com">zina.mak@gmail.com</a>',
    '&nbsp;',
    '<img src="../images/x_red.png" border="0">',
  ],
  [
    '<b>7.</b>',
    'Adam Wells ',
    '1000 New Jersey Ave SE, Apt 328, Washington, DC, USA',
    '225 Lbs',
    '05/Apr/1983',
    '38',
    'Floater',
    '',
    'Group 1',
    '',
    '',
    '5172567311',
    '5172567311',
    '<a href="mailto:adamtwells@gmail.com">adamtwells@gmail.com</a>',
    '&nbsp;',
    '<img src="../images/check_blue.png" border="0">',
  ],
  [
    '<b>8.</b>',
    'Sean Westoby',
    ', , , USA',
    '80 Kg',
    '13/Dec/1987',
    '33',
    'Skipper',
    '',
    '',
    '',
    '',
    '',
    '',
    '<a href="mailto:seanwwestoby@gmail.com">seanwwestoby@gmail.com</a>',
    '&nbsp;',
    '<img src="../images/x_red.png" border="0">',
  ],
  ['&nbsp;'],
  [
    '<b>Total Crew Weight:</b>&nbsp;&nbsp;&nbsp;<br><b>Note:</b> Weight added only when units are known (Lbs/Kg)&nbsp;&nbsp;&nbsp;',
    '\n\t<b>1,356.32 Lbs<br> 615.4 Kg</b>\n\t',
    '<b>Avg. Age:</b> 38.6',
    '&nbsp;',
    '<b>Approve all Crew</b>\n' +
      `\t\t<input type="radio" id="Class_Y" name="Team_Approve" value="./crew_approve_all_crew.cfm?approve_all_crew=1&amp;yid=206318&amp;eid=12987" onclick="PopWindow(this.value,'ClassCrewMark_Y','800','450','yes')"> Yes\n` +
      `\t\t<input type="radio" id="Class_Y" name="Team_Approve" value="./crew_approve_all_crew.cfm?approve_all_crew=0&amp;yid=206318&amp;eid=12987" onclick="PopWindow(this.value,'ClassCrewMark_Y','800','450','yes')"> No\n` +
      '\t\t',
  ],
  ['<hr size="1" style="color: silver" noshade="">'],
  [''],
  [
    '<b>Isbjorn - USA 14571 - Swan 48 - (Crew: </b><b style="color: red">6</b>)',
  ],
  [
    '<b>1.</b>',
    'Thomas Burns',
    '74241 Military Rd, Covington, LA, USA',
    '195 Lbs',
    '07/Mar/1965',
    '56',
    'Spinnaker trimmer',
    '',
    'Group 1',
    '765085R',
    '',
    '+19856301247',
    '9856301247',
    '<a href="mailto:freediver36@gmail.com">freediver36@gmail.com</a>',
    '&nbsp;',
    '<img src="../images/check_blue.png" border="0">',
  ],
  [
    '<b>2.</b>',
    'John Paul Garhart',
    '4101 Wood St, Erie, PA, USA',
    '170 Lbs',
    '30/Sep/1946',
    '75',
    'Main Trimmer',
    '',
    'Group 1',
    '',
    '',
    '+18148645317',
    '8143501617',
    '<a href="mailto:jgarhart@msn.com">jgarhart@msn.com</a>',
    '&nbsp;',
    '<img src="../images/check_blue.png" border="0">',
  ],
  [
    '<b>3.</b>',
    'Vincet Mattiola',
    '2786 Flint Hill Rd, Coopersburg, PA, USA',
    '180 Lbs',
    '03/May/1992',
    '29',
    'Captain',
    '',
    '',
    '',
    '',
    '+14845508122',
    '+14845508122',
    '<a href="mailto:vinny@cetosea.com">vinny@cetosea.com</a>',
    '&nbsp;',
    '<img src="../images/check_blue.png" border="0">',
  ],
  [
    '<b>4.</b>',
    'Rachel Morris',
    '160 hillside st , Asheville, NC, USA',
    '130 Lbs',
    '10/Aug/1998',
    '23',
    'Bow',
    '',
    '',
    '',
    '',
    '3368298074',
    '',
    '<a href="mailto:rachelmorris73@gmail.com">rachelmorris73@gmail.com</a>',
    '&nbsp;',
    '<img src="../images/check_blue.png" border="0">',
  ],
  [
    '<b>5.</b>',
    'Ben Soofer',
    '5615 Newington Rd, Bethesda, Maryland, United States',
    '185 Lbs',
    '27/Mar/1997',
    '24',
    'Tactician',
    '',
    '',
    '',
    '',
    '2406762640',
    '',
    '<a href="mailto:ben.soofer@gmail.com">ben.soofer@gmail.com</a>',
    '&nbsp;',
    '<img src="../images/check_blue.png" border="0">',
  ],
  [
    '<b>6.</b>',
    'Laura Young',
    '65 West 13th St, Apt 7E, New York, NY, USA',
    '180 Lbs',
    '24/Jul/1961',
    '60',
    'Headsail Trimmer',
    '',
    'Group 1',
    '',
    '',
    '+12129896994',
    '+16462455623',
    '<a href="mailto:editpointtv@gmail.com">editpointtv@gmail.com</a>',
    '&nbsp;',
    '<img src="../images/check_blue.png" border="0">',
  ],
  ['&nbsp;'],
  [
    '<b>Total Crew Weight:</b>&nbsp;&nbsp;&nbsp;<br><b>Note:</b> Weight added only when units are known (Lbs/Kg)&nbsp;&nbsp;&nbsp;',
    '\n\t<b>1,040.00 Lbs<br> 471.9 Kg</b>\n\t',
    '<b>Avg. Age:</b> 44.5',
    '&nbsp;',
    '<b>Approve all Crew</b>\n' +
      `\t\t<input type="radio" id="Class_Y" name="Team_Approve" value="./crew_approve_all_crew.cfm?approve_all_crew=1&amp;yid=206319&amp;eid=12987" onclick="PopWindow(this.value,'ClassCrewMark_Y','800','450','yes')"> Yes\n` +
      `\t\t<input type="radio" id="Class_Y" name="Team_Approve" value="./crew_approve_all_crew.cfm?approve_all_crew=0&amp;yid=206319&amp;eid=12987" onclick="PopWindow(this.value,'ClassCrewMark_Y','800','450','yes')"> No\n` +
      '\t\t',
  ],
  ['<hr size="1" style="color: silver" noshade="">'],
  [''],
  [
    '<b>Luna - USA 61216 - Spirit 47 Cr - (Crew: </b><b style="color: red">2</b>)',
  ],
  [
    '<b>1.</b>',
    'Anthony Johnson',
    '887 State Road Vineyard Haven, MA, 02568, USA',
    '230 Lbs',
    '15/Apr/1993',
    '28',
    'Co-Skipper',
    '',
    'Group 1',
    '',
    '1',
    '4014261495',
    '4014261495',
    '<a href="mailto:asj093@gmail.com">asj093@gmail.com</a>',
    '&nbsp;',
    '<img src="../images/check_blue.png" border="0">',
  ],
  [
    '<b>2.</b>',
    'Alessandro Pagani',
    '6 Moon Hill Rd., Lexington, MA, USA',
    '190 ',
    '07/Nov/1969',
    '52',
    'Skipper',
    'USAAP107',
    '',
    '698802S',
    '1',
    '978-760-3200',
    '978-760-3200',
    '<a href="mailto:Apagani@verizon.net">Apagani@verizon.net</a>',
    '&nbsp;',
    '<img src="../images/x_red.png" border="0">',
  ],
  ['&nbsp;'],
  [
    '<b>Total Crew Weight:</b>&nbsp;&nbsp;&nbsp;<br><b>Note:</b> Weight added only when units are known (Lbs/Kg)&nbsp;&nbsp;&nbsp;',
    '\n\t<b> 230.00 Lbs<br> 104.4 Kg</b>\n\t',
    '<b>Avg. Age:</b> 40.0',
    '&nbsp;',
    '<b>Approve all Crew</b>\n' +
      `\t\t<input type="radio" id="Class_Y" name="Team_Approve" value="./crew_approve_all_crew.cfm?approve_all_crew=1&amp;yid=206299&amp;eid=12987" onclick="PopWindow(this.value,'ClassCrewMark_Y','800','450','yes')"> Yes\n` +
      `\t\t<input type="radio" id="Class_Y" name="Team_Approve" value="./crew_approve_all_crew.cfm?approve_all_crew=0&amp;yid=206299&amp;eid=12987" onclick="PopWindow(this.value,'ClassCrewMark_Y','800','450','yes')"> No\n` +
      '\t\t',
  ],
  ['<hr size="1" style="color: silver" noshade="">'],
  [''],
];

describe('yachtScoring - functions to test credentials of Yachtscoring.com, scrape events and yachts/crews data', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('loginProcess - should return true if supplied credentials is correct', async () => {
    const browser = await launchBrowser();
    const page = await browser.newPage();
    const spy = jest.spyOn(page, '$eval');
    spy.mockImplementationOnce(async () => {
      return mockLoginSuccessTableHtml;
    });
    const result = await yachtScoring.loginProcess(page, {
      user: 'test',
      password: 'test',
    });

    expect(page.goto).toHaveBeenCalledTimes(1);
    expect(page.waitForSelector).toHaveBeenCalledTimes(2);
    expect(page.type).toHaveBeenCalledTimes(2);
    expect(page.click).toHaveBeenCalledTimes(1);
    expect(page.waitForNavigation).toHaveBeenCalledTimes(1);

    expect(result).toEqual(true);
  });
  it('loginProcess - should return false if supplied credentials is incorrect', async () => {
    const browser = await launchBrowser();
    const page = await browser.newPage();
    const spy = jest.spyOn(page, '$eval');
    spy.mockImplementationOnce(async () => {
      throw new Error('Mocked error failed to find selector');
    });
    const result = await yachtScoring.loginProcess(page, {
      user: 'test',
      password: 'test',
    });

    expect(page.goto).toHaveBeenCalledTimes(1);
    expect(page.waitForSelector).toHaveBeenCalledTimes(2);
    expect(page.type).toHaveBeenCalledTimes(2);
    expect(page.click).toHaveBeenCalledTimes(1);
    expect(page.waitForNavigation).toHaveBeenCalledTimes(1);

    expect(result).toEqual(false);
  });

  it('testCredentials - should fire up browser instance and return result of login process', async () => {
    const spy = jest.spyOn(yachtScoring, 'loginProcess');
    spy.mockImplementationOnce(async () => {
      return true;
    });
    const result = await yachtScoring.testCredentials('test', 'test');
    expect(result).toEqual(true);

    spy.mockImplementationOnce(async () => {
      return false;
    });
    const failedResult = await yachtScoring.testCredentials('test', 'test');
    expect(failedResult).toEqual(false);
  });

  it('fetchEvents - should return available events for that credentials', async () => {
    const spy = jest.spyOn(yachtScoring, 'loginProcess');
    spy.mockImplementationOnce(async () => {
      return true;
    });

    const browser = await launchBrowser();
    const page = await browser.newPage();
    const spyPage = jest.spyOn(page, '$$eval');
    spyPage.mockImplementationOnce(async () => {
      return mockLoginSuccessWithEventsArray;
    });
    const result = await yachtScoring.fetchEvents('test', 'test');
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          link: expect.any(String),
          eventId: '12987',
          eventName: 'Spirit of Bermuda Charity Rally',
        }),
      ]),
    );
  });

  it('scrapeEventById - should return all yacht with crews for selected event', async () => {
    const spy = jest.spyOn(yachtScoring, 'loginProcess');
    spy.mockImplementationOnce(async () => {
      return true;
    });

    const browser = await launchBrowser();
    const page = await browser.newPage();
    const spyPage = jest.spyOn(page, '$$eval');
    spyPage.mockImplementationOnce(async () => {
      return mockYachtTableArray;
    });
    spyPage.mockImplementationOnce(async () => {
      return mockCrewTableArray;
    });
    const result = await yachtScoring.scrapeEventById('test', 'test', '12987');
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          sailNumber: 'USA 51235',
          crews: expect.arrayContaining([
            expect.objectContaining({
              name: 'Carl Forsander',
              sailorClass: 'Group 1',
              phone: '310-384-9289',
            }),
          ]),
        }),
      ]),
    );
  });
});
