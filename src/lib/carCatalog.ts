/**
 * Makes and models common on the Egyptian market, with the years each model was sold there
 * (approximate). The car form uses it for make → model → year pickers; anything missing can
 * still be typed by hand.
 */

export type CatalogModel = {
  name: string;
  from: number;
  /** Last model year sold in Egypt; omitted while it is still on sale. */
  to?: number;
};

export type CatalogMake = {
  name: string;
  nameAr: string;
  models: CatalogModel[];
};

export const CAR_CATALOG: CatalogMake[] = [
  {
    name: 'Hyundai',
    nameAr: 'هيونداي',
    models: [
      { name: 'Accent', from: 2023 },
      { name: 'Accent HCI', from: 2006, to: 2011 },
      { name: 'Accent RB', from: 2011, to: 2023 },
      { name: 'Bayon', from: 2022 },
      { name: 'Creta', from: 2016 },
      { name: 'Elantra AD', from: 2016, to: 2021 },
      { name: 'Elantra CN7', from: 2021 },
      { name: 'Elantra HD', from: 2007, to: 2016 },
      { name: 'Elantra MD', from: 2011, to: 2016 },
      { name: 'Getz', from: 2003, to: 2011 },
      { name: 'Grand i10', from: 2014 },
      { name: 'i10', from: 2008, to: 2016 },
      { name: 'i20', from: 2009 },
      { name: 'i30', from: 2008, to: 2017 },
      { name: 'Matrix', from: 2002, to: 2010 },
      { name: 'Santa Fe', from: 2001 },
      { name: 'Tucson', from: 2005 },
      { name: 'Verna', from: 2006, to: 2023 },
    ],
  },
  {
    name: 'Kia',
    nameAr: 'كيا',
    models: [
      { name: 'Carens', from: 2003, to: 2017 },
      { name: 'Cerato', from: 2004 },
      { name: 'Pegas', from: 2019 },
      { name: 'Picanto', from: 2004 },
      { name: 'Rio', from: 2003 },
      { name: 'Seltos', from: 2020 },
      { name: 'Sonet', from: 2021 },
      { name: 'Sorento', from: 2003 },
      { name: 'Soluto', from: 2019 },
      { name: 'Sportage', from: 2005 },
      { name: 'XCeed', from: 2020 },
    ],
  },
  {
    name: 'Nissan',
    nameAr: 'نيسان',
    models: [
      { name: 'Juke', from: 2011 },
      { name: 'Kicks', from: 2018 },
      { name: 'Pick Up', from: 1998 },
      { name: 'Qashqai', from: 2008 },
      { name: 'Sentra', from: 2007 },
      { name: 'Sunny', from: 2006 },
      { name: 'Tiida', from: 2006, to: 2012 },
      { name: 'X-Trail', from: 2002 },
    ],
  },
  {
    name: 'Toyota',
    nameAr: 'تويوتا',
    models: [
      { name: 'Belta', from: 2022 },
      { name: 'C-HR', from: 2017 },
      { name: 'Camry', from: 2000 },
      { name: 'Corolla', from: 1995 },
      { name: 'Fortuner', from: 2006 },
      { name: 'Hilux', from: 2000 },
      { name: 'Land Cruiser', from: 1990 },
      { name: 'RAV4', from: 2001 },
      { name: 'Rush', from: 2018 },
      { name: 'Yaris', from: 2006 },
    ],
  },
  {
    name: 'Chevrolet',
    nameAr: 'شيفروليه',
    models: [
      { name: 'Aveo', from: 2003, to: 2018 },
      { name: 'Captiva', from: 2007 },
      { name: 'Cruze', from: 2009, to: 2016 },
      { name: 'Lanos', from: 1998, to: 2012 },
      { name: 'N300', from: 2012 },
      { name: 'Optra', from: 2004 },
      { name: 'Spark', from: 2006 },
    ],
  },
  {
    name: 'Renault',
    nameAr: 'رينو',
    models: [
      { name: 'Austral', from: 2023 },
      { name: 'Captur', from: 2018 },
      { name: 'Clio', from: 2000, to: 2012 },
      { name: 'Duster', from: 2010 },
      { name: 'Fluence', from: 2010, to: 2016 },
      { name: 'Kadjar', from: 2016, to: 2020 },
      { name: 'Logan', from: 2008, to: 2022 },
      { name: 'Megane', from: 2003 },
      { name: 'Sandero', from: 2010 },
      { name: 'Sandero Stepway', from: 2010 },
      { name: 'Taliant', from: 2022 },
    ],
  },
  {
    name: 'Peugeot',
    nameAr: 'بيجو',
    models: [
      { name: '2008', from: 2014 },
      { name: '206', from: 1999, to: 2011 },
      { name: '207', from: 2007, to: 2014 },
      { name: '301', from: 2013 },
      { name: '3008', from: 2009 },
      { name: '307', from: 2002, to: 2010 },
      { name: '308', from: 2008 },
      { name: '405', from: 1990, to: 2006 },
      { name: '408', from: 2023 },
      { name: '5008', from: 2010 },
      { name: '508', from: 2011 },
    ],
  },
  {
    name: 'Mitsubishi',
    nameAr: 'ميتسوبيشي',
    models: [
      { name: 'Attrage', from: 2014 },
      { name: 'Eclipse Cross', from: 2018 },
      { name: 'L200', from: 1990 },
      { name: 'Lancer', from: 1990, to: 2018 },
      { name: 'Mirage', from: 2013 },
      { name: 'Outlander', from: 2003 },
      { name: 'Pajero', from: 1990 },
      { name: 'Xpander', from: 2019 },
    ],
  },
  {
    name: 'Suzuki',
    nameAr: 'سوزوكي',
    models: [
      { name: 'Alto', from: 2000 },
      { name: 'Celerio', from: 2015 },
      { name: 'Ciaz', from: 2015 },
      { name: 'Dzire', from: 2017 },
      { name: 'Ertiga', from: 2013 },
      { name: 'Jimny', from: 1998 },
      { name: 'Maruti 800', from: 1990, to: 2012 },
      { name: 'S-Presso', from: 2020 },
      { name: 'Swift', from: 2005 },
      { name: 'Van', from: 1990 },
      { name: 'Vitara', from: 2015 },
    ],
  },
  {
    name: 'Fiat',
    nameAr: 'فيات',
    models: [
      { name: '128', from: 1972, to: 2008 },
      { name: '131 Shahin', from: 1990, to: 2008 },
      { name: '500X', from: 2015 },
      { name: 'Doblo', from: 2001 },
      { name: 'Punto', from: 1999, to: 2018 },
      { name: 'Siena', from: 1998, to: 2008 },
      { name: 'Tipo', from: 2016 },
      { name: 'Uno', from: 1990, to: 2010 },
    ],
  },
  {
    name: 'Skoda',
    nameAr: 'سكودا',
    models: [
      { name: 'Fabia', from: 2000 },
      { name: 'Kamiq', from: 2020 },
      { name: 'Karoq', from: 2018 },
      { name: 'Kodiaq', from: 2017 },
      { name: 'Octavia', from: 1998 },
      { name: 'Scala', from: 2020 },
      { name: 'Superb', from: 2002 },
    ],
  },
  {
    name: 'Volkswagen',
    nameAr: 'فولكس فاجن',
    models: [
      { name: 'Bora', from: 1999, to: 2005 },
      { name: 'Golf', from: 1995 },
      { name: 'Jetta', from: 2006, to: 2019 },
      { name: 'Passat', from: 1995 },
      { name: 'Polo', from: 2002 },
      { name: 'T-Roc', from: 2018 },
      { name: 'Tiguan', from: 2008 },
    ],
  },
  {
    name: 'Opel',
    nameAr: 'أوبل',
    models: [
      { name: 'Astra', from: 1995 },
      { name: 'Corsa', from: 1995 },
      { name: 'Crossland', from: 2018 },
      { name: 'Grandland', from: 2018 },
      { name: 'Insignia', from: 2009, to: 2017 },
      { name: 'Mokka', from: 2013 },
      { name: 'Vectra', from: 1995, to: 2008 },
    ],
  },
  {
    name: 'MG',
    nameAr: 'إم جي',
    models: [
      { name: 'MG 4', from: 2023 },
      { name: 'MG 5', from: 2012 },
      { name: 'MG 6', from: 2017 },
      { name: 'HS', from: 2019 },
      { name: 'RX5', from: 2018 },
      { name: 'ZS', from: 2018 },
    ],
  },
  {
    name: 'Chery',
    nameAr: 'شيري',
    models: [
      { name: 'Arrizo 5', from: 2016 },
      { name: 'Tiggo 3', from: 2014, to: 2021 },
      { name: 'Tiggo 4 Pro', from: 2021 },
      { name: 'Tiggo 7', from: 2017 },
      { name: 'Tiggo 7 Pro', from: 2021 },
      { name: 'Tiggo 8 Pro', from: 2021 },
    ],
  },
  {
    name: 'Speranza',
    nameAr: 'سبيرانزا',
    models: [
      { name: 'A113', from: 2008, to: 2016 },
      { name: 'A516', from: 2008, to: 2016 },
      { name: 'Envy', from: 2012, to: 2018 },
      { name: 'M11', from: 2011, to: 2016 },
      { name: 'Tiggo', from: 2012, to: 2018 },
    ],
  },
  {
    name: 'BYD',
    nameAr: 'بي واي دي',
    models: [
      { name: 'Atto 3', from: 2024 },
      { name: 'F3', from: 2007, to: 2021 },
    ],
  },
  {
    name: 'Geely',
    nameAr: 'جيلي',
    models: [
      { name: 'Coolray', from: 2020 },
      { name: 'Emgrand', from: 2012 },
      { name: 'Pandino', from: 2011, to: 2015 },
    ],
  },
  {
    name: 'Haval',
    nameAr: 'هافال',
    models: [
      { name: 'H6', from: 2021 },
      { name: 'Jolion', from: 2021 },
    ],
  },
  {
    name: 'Jetour',
    nameAr: 'جيتور',
    models: [
      { name: 'Dashing', from: 2023 },
      { name: 'X70', from: 2022 },
      { name: 'X90 Plus', from: 2023 },
    ],
  },
  {
    name: 'Proton',
    nameAr: 'بروتون',
    models: [
      { name: 'Gen-2', from: 2005, to: 2012 },
      { name: 'Persona', from: 2016 },
      { name: 'Saga', from: 2016 },
    ],
  },
  {
    name: 'Honda',
    nameAr: 'هوندا',
    models: [
      { name: 'Accord', from: 1995 },
      { name: 'City', from: 2003 },
      { name: 'Civic', from: 1995 },
      { name: 'CR-V', from: 1998 },
      { name: 'HR-V', from: 2016 },
      { name: 'Jazz', from: 2003, to: 2020 },
    ],
  },
  {
    name: 'Mazda',
    nameAr: 'مازدا',
    models: [
      { name: '323', from: 1990, to: 2004 },
      { name: 'Mazda 3', from: 2004 },
      { name: 'Mazda 6', from: 2003 },
      { name: 'CX-5', from: 2013 },
    ],
  },
  {
    name: 'Ford',
    nameAr: 'فورد',
    models: [
      { name: 'EcoSport', from: 2014 },
      { name: 'Fiesta', from: 2002, to: 2019 },
      { name: 'Focus', from: 2000 },
      { name: 'Kuga', from: 2013 },
      { name: 'Ranger', from: 2000 },
    ],
  },
  {
    name: 'Citroën',
    nameAr: 'ستروين',
    models: [
      { name: 'C-Elysée', from: 2013 },
      { name: 'C3', from: 2002 },
      { name: 'C4', from: 2004 },
      { name: 'C5 Aircross', from: 2019 },
    ],
  },
  {
    name: 'Seat',
    nameAr: 'سيات',
    models: [
      { name: 'Arona', from: 2018 },
      { name: 'Ateca', from: 2017 },
      { name: 'Ibiza', from: 1993 },
      { name: 'Leon', from: 1999 },
      { name: 'Toledo', from: 1991, to: 2019 },
    ],
  },
  {
    name: 'Jeep',
    nameAr: 'جيب',
    models: [
      { name: 'Cherokee', from: 2001 },
      { name: 'Compass', from: 2007 },
      { name: 'Grand Cherokee', from: 1993 },
      { name: 'Renegade', from: 2016 },
      { name: 'Wrangler', from: 1990 },
    ],
  },
  {
    name: 'Daewoo',
    nameAr: 'دايو',
    models: [
      { name: 'Lanos', from: 1998, to: 2012 },
      { name: 'Nubira', from: 1997, to: 2004 },
    ],
  },
  {
    name: 'Lada',
    nameAr: 'لادا',
    models: [
      { name: '2107', from: 1990, to: 2012 },
      { name: 'Granta', from: 2013 },
      { name: 'Niva', from: 1990 },
    ],
  },
  {
    name: 'BMW',
    nameAr: 'بي إم دبليو',
    models: [
      { name: '1 Series', from: 2005 },
      { name: '3 Series', from: 1990 },
      { name: '5 Series', from: 1990 },
      { name: '7 Series', from: 1990 },
      { name: 'X1', from: 2010 },
      { name: 'X3', from: 2004 },
      { name: 'X5', from: 2000 },
      { name: 'X6', from: 2008 },
    ],
  },
  {
    name: 'Mercedes-Benz',
    nameAr: 'مرسيدس',
    models: [
      { name: 'A-Class', from: 2013 },
      { name: 'C-Class', from: 1994 },
      { name: 'CLA', from: 2014 },
      { name: 'E-Class', from: 1995 },
      { name: 'GLA', from: 2014 },
      { name: 'GLC', from: 2016 },
      { name: 'GLE', from: 2015 },
      { name: 'S-Class', from: 1991 },
    ],
  },
];

/** Oldest year offered when the make or model is not in the catalog. */
const OLDEST_YEAR = 1970;

export function findMake(name: string): CatalogMake | undefined {
  const n = name.trim().toLowerCase();
  return CAR_CATALOG.find((m) => m.name.toLowerCase() === n || m.nameAr === name.trim());
}

export function findModel(make: string, model: string): CatalogModel | undefined {
  const n = model.trim().toLowerCase();
  return findMake(make)?.models.find((m) => m.name.toLowerCase() === n);
}

/** Model years to offer, newest first: the model's years in Egypt when known, otherwise all. */
export function yearsFor(make: string, model: string, now = new Date()): number[] {
  const latest = now.getFullYear() + 1;
  const known = findModel(make, model);
  const from = known?.from ?? OLDEST_YEAR;
  const to = Math.min(known?.to ?? latest, latest);
  const years: number[] = [];
  for (let y = to; y >= from; y--) years.push(y);
  return years;
}
