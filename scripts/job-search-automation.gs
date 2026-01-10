/**
 * Google Apps Script for Automated Job Searching
 *
 * Configuration:
 * - Set API_KEY, SEARCH_ENGINE_ID, and SHEET_ID in Script Properties
 *   (File > Project Settings > Script Properties)
 *
 * Usage:
 * - Run runDailyJobSearch() manually or set up a daily trigger
 * - Set up trigger: Triggers > Add Trigger > runDailyJobSearch > Time-driven > Day timer
 */

// ============================================================================
// JOB TITLES CONFIGURATION
// ============================================================================

const JOB_TITLES = [
  // Program Management
  { title: "Program Manager", category: "Program Management" },
  { title: "Senior Program Manager", category: "Program Management" },
  { title: "Director of Program Management", category: "Program Management" },
  { title: "Strategic Program Manager", category: "Program Management" },
  { title: "Principal Program Manager", category: "Program Management" },
  { title: "Global Program Manager", category: "Program Management" },

  // Operations
  { title: "Operations Manager", category: "Operations" },
  { title: "Senior Operations Manager", category: "Operations" },
  { title: "Director of Operations", category: "Operations" },
  { title: "General Manager", category: "Operations" },
  { title: "Site Manager", category: "Operations" },
  { title: "Regional Operations Manager", category: "Operations" },
  { title: "Business Operations Manager", category: "Operations" },

  // Customer Success
  { title: "Customer Success Manager", category: "Customer Success" },
  { title: "Customer Experience Manager", category: "Customer Success" },
  { title: "Director of Customer Experience", category: "Customer Success" },
  { title: "Director of Customer Success", category: "Customer Success" },
  { title: "Head of Customer Success", category: "Customer Success" },
  { title: "VOC Manager", category: "Customer Success" },
  { title: "Customer Operations Manager", category: "Customer Success" },

  // Product/Process
  { title: "Product Operations Manager", category: "Product/Process" },
  { title: "Continuous Improvement Manager", category: "Product/Process" },
  { title: "Operational Excellence Manager", category: "Product/Process" },
  { title: "Process Improvement Manager", category: "Product/Process" },
  { title: "Business Transformation Manager", category: "Product/Process" },

  // Supply Chain
  { title: "Supply Chain Manager", category: "Supply Chain" },
  { title: "Logistics Manager", category: "Supply Chain" },
  { title: "Fulfillment Manager", category: "Supply Chain" },
  { title: "Last Mile Manager", category: "Supply Chain" },

  // Strategic
  { title: "Chief of Staff", category: "Strategic" }
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Gets a Script Property with error handling
 * @param {string} key - The property key
 * @returns {string} The property value
 * @throws {Error} If the property is not set
 */
function getScriptProperty(key) {
  const value = PropertiesService.getScriptProperties().getProperty(key);
  if (!value) {
    throw new Error(`Script Property '${key}' is not set. Please configure it in File > Project Settings > Script Properties.`);
  }
  return value;
}

/**
 * Formats today's date as MM/DD/YYYY
 * @returns {string} Formatted date
 */
function getTodayFormatted() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const year = today.getFullYear();
  return `${month}/${day}/${year}`;
}

/**
 * Sleeps for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 */
function sleep(ms) {
  Utilities.sleep(ms);
}

// ============================================================================
// SEARCH FUNCTION
// ============================================================================

/**
 * Searches Google Custom Search API for jobs
 * @param {string} query - The search query
 * @returns {Array<{title: string, link: string, snippet: string}>} Array of search results
 */
function searchGoogleJobs(query) {
  const apiKey = getScriptProperty('API_KEY');
  const searchEngineId = getScriptProperty('SEARCH_ENGINE_ID');

  const encodedQuery = encodeURIComponent(query);
  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodedQuery}`;

  try {
    const response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true
    });

    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();

    if (responseCode !== 200) {
      console.error(`API Error (${responseCode}): ${responseText}`);
      return [];
    }

    const data = JSON.parse(responseText);

    if (!data.items || data.items.length === 0) {
      console.log(`No results found for query: ${query}`);
      return [];
    }

    return data.items.map(item => ({
      title: item.title || '',
      link: item.link || '',
      snippet: item.snippet || ''
    }));

  } catch (error) {
    console.error(`Error searching for "${query}": ${error.message}`);
    return [];
  }
}

// ============================================================================
// PARSING FUNCTIONS
// ============================================================================

/**
 * Extracts company name from URL, title, or snippet
 * @param {string} url - The job posting URL
 * @param {string} title - The job title
 * @param {string} snippet - The job snippet
 * @returns {string} The extracted company name
 */
function parseCompanyName(url, title, snippet) {
  try {
    const lowerUrl = url.toLowerCase();

    // Pattern: boards.greenhouse.io/[company]
    const greenhouseMatch = url.match(/boards\.greenhouse\.io\/([^\/\?]+)/i);
    if (greenhouseMatch) {
      return formatCompanyName(greenhouseMatch[1]);
    }

    // Pattern: jobs.lever.co/[company]
    const leverMatch = url.match(/jobs\.lever\.co\/([^\/\?]+)/i);
    if (leverMatch) {
      return formatCompanyName(leverMatch[1]);
    }

    // Pattern: [company].ashbyhq.com or ashbyhq.com/[company]
    const ashbyMatch1 = url.match(/([^\/\.]+)\.ashbyhq\.com/i);
    if (ashbyMatch1 && ashbyMatch1[1] !== 'jobs' && ashbyMatch1[1] !== 'www') {
      return formatCompanyName(ashbyMatch1[1]);
    }
    const ashbyMatch2 = url.match(/ashbyhq\.com\/([^\/\?]+)/i);
    if (ashbyMatch2) {
      return formatCompanyName(ashbyMatch2[1]);
    }

    // Pattern: [company].workday.com
    const workdayMatch = url.match(/([^\/\.]+)\.(?:wd\d+\.)?myworkdayjobs\.com/i);
    if (workdayMatch) {
      return formatCompanyName(workdayMatch[1]);
    }

    // Pattern: careers.[company].com
    const careersMatch = url.match(/careers\.([^\/\.]+)\./i);
    if (careersMatch) {
      return formatCompanyName(careersMatch[1]);
    }

    // Pattern: jobs.[company].com
    const jobsMatch = url.match(/jobs\.([^\/\.]+)\./i);
    if (jobsMatch) {
      return formatCompanyName(jobsMatch[1]);
    }

    // Fallback: Extract from title ("Job at Company" or "Job - Company")
    const titleAtMatch = title.match(/(?:at|@)\s+([^|–\-]+)/i);
    if (titleAtMatch) {
      return titleAtMatch[1].trim();
    }

    const titleDashMatch = title.match(/[–\-]\s*([^|–\-]+)\s*$/);
    if (titleDashMatch) {
      const potential = titleDashMatch[1].trim();
      // Make sure it's not a location
      if (!potential.match(/remote|austin|texas|tx|hybrid/i)) {
        return potential;
      }
    }

    // Check snippet for company mentions
    const snippetAtMatch = snippet.match(/(?:at|@)\s+([A-Z][a-zA-Z0-9\s&]+?)(?:\s+is|\s+we|\.|,)/);
    if (snippetAtMatch) {
      return snippetAtMatch[1].trim();
    }

    // Last resort
    return "Unknown";

  } catch (error) {
    console.error(`Error parsing company name: ${error.message}`);
    return "Unknown";
  }
}

/**
 * Formats company name from URL slug
 * @param {string} slug - URL slug
 * @returns {string} Formatted company name
 */
function formatCompanyName(slug) {
  return slug
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
    .trim();
}

/**
 * Extracts salary information from snippet and title
 * @param {string} snippet - The job snippet
 * @param {string} title - The job title
 * @returns {string} Salary information or "Not listed"
 */
function parseSalary(snippet, title) {
  try {
    const text = `${title} ${snippet}`;

    // Check for zone-based salary (common in remote jobs)
    // Pattern: Zone 2 ... $X - $Y or Austin ... $X - $Y
    const zonePatterns = [
      // Look for Austin-specific zone mention
      /(?:austin|zone\s*2)[^$]*\$[\d,]+(?:k)?(?:\s*[-–]\s*\$[\d,]+(?:k)?)?/gi,
      // Look for salary with zone mention
      /\$[\d,]+(?:k)?(?:\s*[-–]\s*\$[\d,]+(?:k)?)?[^.]*(?:zone\s*2|austin)/gi
    ];

    for (const pattern of zonePatterns) {
      const zoneMatch = text.match(pattern);
      if (zoneMatch) {
        const salaryInZone = extractSalaryFromText(zoneMatch[0]);
        if (salaryInZone) {
          return `${salaryInZone} (Zone 2 - Austin)`;
        }
      }
    }

    // Standard salary range pattern: $X - $Y or $X-$Y or $X – $Y
    const rangeMatch = text.match(/\$[\d,]+(?:k)?(?:\s*[-–]\s*\$[\d,]+(?:k)?)/i);
    if (rangeMatch) {
      return formatSalaryString(rangeMatch[0]);
    }

    // Single salary: $X,XXX or $XXXK
    const singleMatch = text.match(/\$[\d,]+(?:k)?(?:\s*(?:per\s+year|annually|\/yr|\/year))?/i);
    if (singleMatch) {
      return formatSalaryString(singleMatch[0]);
    }

    // Numeric range with K: 120K - 150K
    const kRangeMatch = text.match(/(\d{2,3})k\s*[-–]\s*(\d{2,3})k/i);
    if (kRangeMatch) {
      return `$${kRangeMatch[1]},000 - $${kRangeMatch[2]},000`;
    }

    return "Not listed";

  } catch (error) {
    console.error(`Error parsing salary: ${error.message}`);
    return "Not listed";
  }
}

/**
 * Extracts salary amount from text containing other words
 * @param {string} text - Text containing salary
 * @returns {string|null} Formatted salary or null
 */
function extractSalaryFromText(text) {
  const rangeMatch = text.match(/\$[\d,]+(?:k)?(?:\s*[-–]\s*\$[\d,]+(?:k)?)/i);
  if (rangeMatch) {
    return formatSalaryString(rangeMatch[0]);
  }
  const singleMatch = text.match(/\$[\d,]+(?:k)?/i);
  if (singleMatch) {
    return formatSalaryString(singleMatch[0]);
  }
  return null;
}

/**
 * Formats salary string consistently
 * @param {string} salary - Raw salary string
 * @returns {string} Formatted salary
 */
function formatSalaryString(salary) {
  return salary
    .replace(/\s+/g, ' ')
    .replace(/–/g, '-')
    .replace(/(\d)k/gi, '$1,000')
    .trim();
}

/**
 * Parses location type from snippet and title
 * @param {string} snippet - The job snippet
 * @param {string} title - The job title
 * @returns {string} "Remote", "Hybrid", "On-site", or "Unknown"
 */
function parseLocationType(snippet, title) {
  try {
    const text = `${title} ${snippet}`.toLowerCase();

    // Check for explicit remote indicators
    if (text.match(/\bfully\s+remote\b|\bremote\s+only\b|\b100%\s+remote\b|\bwork\s+from\s+home\b/)) {
      return "Remote";
    }

    // Check for hybrid indicators
    if (text.match(/\bhybrid\b|\bflex\s*-?\s*hybrid\b|\bremote\s*\/?\s*hybrid\b|\bhybrid\s*\/?\s*remote\b/)) {
      return "Hybrid";
    }

    // Check for on-site indicators
    if (text.match(/\bon[\s-]?site\b|\bin[\s-]?office\b|\bin[\s-]?person\b|\boffice\s+based\b/)) {
      return "On-site";
    }

    // Simple remote check
    if (text.match(/\bremote\b/)) {
      // Check if it's "remote-friendly" or similar (often means hybrid)
      if (text.match(/remote[\s-]?friendly|remote[\s-]?option/)) {
        return "Hybrid";
      }
      return "Remote";
    }

    // If Austin is mentioned without remote/hybrid, likely on-site
    if (text.match(/\baustin\b/)) {
      return "On-site";
    }

    return "Unknown";

  } catch (error) {
    console.error(`Error parsing location type: ${error.message}`);
    return "Unknown";
  }
}

// ============================================================================
// DUPLICATE CHECK
// ============================================================================

/**
 * Checks if URL already exists in the list
 * @param {string} url - URL to check
 * @param {string[]} existingUrls - Array of existing URLs
 * @returns {boolean} True if duplicate
 */
function isDuplicateURL(url, existingUrls) {
  if (!url || !existingUrls || existingUrls.length === 0) {
    return false;
  }

  // Normalize URL for comparison (remove trailing slash, lowercase)
  const normalizedUrl = url.toLowerCase().replace(/\/+$/, '');

  return existingUrls.some(existingUrl => {
    if (!existingUrl) return false;
    const normalizedExisting = existingUrl.toString().toLowerCase().replace(/\/+$/, '');
    return normalizedUrl === normalizedExisting;
  });
}

// ============================================================================
// SHEET FUNCTIONS
// ============================================================================

/**
 * Gets or creates the job search spreadsheet
 * @returns {GoogleAppsScript.Spreadsheet.Sheet} The active sheet
 */
function getJobSheet() {
  const sheetId = getScriptProperty('SHEET_ID');
  const spreadsheet = SpreadsheetApp.openById(sheetId);
  const sheet = spreadsheet.getActiveSheet();

  // Ensure headers exist
  const headers = sheet.getRange(1, 1, 1, 9).getValues()[0];
  if (!headers[0]) {
    sheet.getRange(1, 1, 1, 9).setValues([[
      'Date Added',
      'Job Title',
      'Company',
      'URL',
      'Source',
      'Salary',
      'Location Type',
      'Status',
      'Notes'
    ]]);
    sheet.getRange(1, 1, 1, 9).setFontWeight('bold');
  }

  return sheet;
}

/**
 * Loads existing URLs from the sheet for de-duplication
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The sheet
 * @returns {string[]} Array of existing URLs
 */
function loadExistingUrls(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return [];
  }

  // Column D contains URLs
  const urlRange = sheet.getRange(2, 4, lastRow - 1, 1);
  const urls = urlRange.getValues().flat();

  // Extract URLs from hyperlink formulas if present
  return urls.map(cell => {
    if (typeof cell === 'string' && cell.startsWith('=HYPERLINK')) {
      const match = cell.match(/=HYPERLINK\("([^"]+)"/);
      return match ? match[1] : cell;
    }
    return cell;
  }).filter(url => url);
}

/**
 * Determines the source based on URL
 * @param {string} url - The job URL
 * @returns {string} The source name
 */
function getSourceFromUrl(url) {
  const lowerUrl = url.toLowerCase();

  if (lowerUrl.includes('greenhouse.io')) return 'Greenhouse';
  if (lowerUrl.includes('lever.co')) return 'Lever';
  if (lowerUrl.includes('ashbyhq.com')) return 'Ashby';
  if (lowerUrl.includes('workday')) return 'Workday';
  if (lowerUrl.includes('linkedin.com')) return 'LinkedIn';
  if (lowerUrl.includes('indeed.com')) return 'Indeed';
  if (lowerUrl.includes('glassdoor.com')) return 'Glassdoor';
  if (lowerUrl.includes('ziprecruiter.com')) return 'ZipRecruiter';
  if (lowerUrl.includes('smartrecruiters.com')) return 'SmartRecruiters';
  if (lowerUrl.includes('icims.com')) return 'iCIMS';
  if (lowerUrl.includes('jobvite.com')) return 'Jobvite';
  if (lowerUrl.includes('breezy.hr')) return 'Breezy';

  return 'Other';
}

/**
 * Appends a job to the sheet
 * @param {Object} jobData - Job data object
 * @param {string} jobData.title - Job title
 * @param {string} jobData.company - Company name
 * @param {string} jobData.url - Job URL
 * @param {string} jobData.source - Job source
 * @param {string} jobData.salary - Salary info
 * @param {string} jobData.locationType - Location type
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The sheet to append to
 */
function appendJobToSheet(jobData, sheet) {
  try {
    const today = getTodayFormatted();

    // Create hyperlink formula for URL
    const hyperlinkFormula = `=HYPERLINK("${jobData.url}", "Link")`;

    const rowData = [
      today,                    // Column A: Date
      jobData.title,            // Column B: Job Title
      jobData.company,          // Column C: Company
      hyperlinkFormula,         // Column D: URL as hyperlink
      jobData.source,           // Column E: Source
      jobData.salary,           // Column F: Salary
      jobData.locationType,     // Column G: Location Type
      'New',                    // Column H: Status
      ''                        // Column I: Notes
    ];

    sheet.appendRow(rowData);

  } catch (error) {
    console.error(`Error appending job to sheet: ${error.message}`);
    throw error;
  }
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Main function to run daily job search
 * Set up a daily trigger to run this function
 */
function runDailyJobSearch() {
  console.log('=== Starting Daily Job Search ===');
  console.log(`Date: ${getTodayFormatted()}`);
  console.log(`Searching ${JOB_TITLES.length} job titles`);

  let totalNewJobs = 0;
  let totalDuplicates = 0;
  let totalSearches = 0;
  let totalErrors = 0;

  try {
    // Get the sheet and load existing URLs for de-duplication
    const sheet = getJobSheet();
    const existingUrls = loadExistingUrls(sheet);
    console.log(`Loaded ${existingUrls.length} existing URLs for de-duplication`);

    // Track URLs added this session to avoid duplicates within the same run
    const sessionUrls = [...existingUrls];

    // Process each job title
    for (const jobConfig of JOB_TITLES) {
      totalSearches++;

      // Build search query
      const query = `"${jobConfig.title}" ("Austin, TX" OR "Austin, Texas" OR "remote" OR "hybrid")`;
      console.log(`\n[${totalSearches}/${JOB_TITLES.length}] Searching: ${jobConfig.title}`);

      try {
        // Search for jobs
        const results = searchGoogleJobs(query);
        console.log(`  Found ${results.length} results`);

        // Process each result
        for (const result of results) {
          // Check for duplicates
          if (isDuplicateURL(result.link, sessionUrls)) {
            totalDuplicates++;
            continue;
          }

          // Parse job details
          const company = parseCompanyName(result.link, result.title, result.snippet);
          const salary = parseSalary(result.snippet, result.title);
          const locationType = parseLocationType(result.snippet, result.title);
          const source = getSourceFromUrl(result.link);

          // Prepare job data
          const jobData = {
            title: result.title,
            company: company,
            url: result.link,
            source: source,
            salary: salary,
            locationType: locationType
          };

          // Append to sheet
          appendJobToSheet(jobData, sheet);

          // Add to session URLs to prevent duplicates within this run
          sessionUrls.push(result.link);
          totalNewJobs++;

          console.log(`  + Added: ${company} - ${result.title.substring(0, 50)}...`);
        }

      } catch (searchError) {
        console.error(`  Error searching "${jobConfig.title}": ${searchError.message}`);
        totalErrors++;
      }

      // Add delay between API calls (100ms)
      sleep(100);
    }

  } catch (error) {
    console.error(`Fatal error: ${error.message}`);
    throw error;
  }

  // Log summary
  console.log('\n=== Job Search Complete ===');
  console.log(`Total searches: ${totalSearches}`);
  console.log(`New jobs added: ${totalNewJobs}`);
  console.log(`Duplicates skipped: ${totalDuplicates}`);
  console.log(`Errors encountered: ${totalErrors}`);

  return {
    totalSearches,
    totalNewJobs,
    totalDuplicates,
    totalErrors
  };
}

// ============================================================================
// UTILITY FUNCTIONS FOR MANUAL USE
// ============================================================================

/**
 * Test function to verify configuration
 */
function testConfiguration() {
  console.log('Testing configuration...');

  try {
    const apiKey = getScriptProperty('API_KEY');
    console.log('✓ API_KEY is set');

    const searchEngineId = getScriptProperty('SEARCH_ENGINE_ID');
    console.log('✓ SEARCH_ENGINE_ID is set');

    const sheetId = getScriptProperty('SHEET_ID');
    console.log('✓ SHEET_ID is set');

    // Test sheet access
    const sheet = getJobSheet();
    console.log('✓ Sheet access successful');

    // Test API with a simple query
    const testQuery = '"Program Manager" ("Austin, TX")';
    const results = searchGoogleJobs(testQuery);
    console.log(`✓ API test successful - found ${results.length} results`);

    console.log('\n✓ All configuration tests passed!');

  } catch (error) {
    console.error(`✗ Configuration test failed: ${error.message}`);
  }
}

/**
 * Sets up the daily trigger
 */
function setupDailyTrigger() {
  // Remove existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  for (const trigger of triggers) {
    if (trigger.getHandlerFunction() === 'runDailyJobSearch') {
      ScriptApp.deleteTrigger(trigger);
    }
  }

  // Create new daily trigger (runs at 8 AM)
  ScriptApp.newTrigger('runDailyJobSearch')
    .timeBased()
    .everyDays(1)
    .atHour(8)
    .create();

  console.log('Daily trigger set up to run at 8 AM');
}

/**
 * Removes the daily trigger
 */
function removeDailyTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  for (const trigger of triggers) {
    if (trigger.getHandlerFunction() === 'runDailyJobSearch') {
      ScriptApp.deleteTrigger(trigger);
      console.log('Removed daily trigger');
    }
  }
}

/**
 * Test function to verify all parsing functions work correctly
 * Run this to validate the script behavior before deploying
 */
function testJobSearch() {
  console.log('='.repeat(60));
  console.log('STARTING JOB SEARCH TESTS');
  console.log('='.repeat(60));

  // -------------------------------------------------------------------------
  // TEST 1: Search API with "Senior Program Manager"
  // -------------------------------------------------------------------------
  console.log('\n--- TEST 1: Search API ---');
  console.log('Query: "Senior Program Manager" ("Austin, TX" OR "Austin, Texas" OR "remote" OR "hybrid")');

  try {
    const apiKey = getScriptProperty('API_KEY');
    const searchEngineId = getScriptProperty('SEARCH_ENGINE_ID');

    const query = '"Senior Program Manager" ("Austin, TX" OR "Austin, Texas" OR "remote" OR "hybrid")';
    const encodedQuery = encodeURIComponent(query);
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodedQuery}`;

    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const responseCode = response.getResponseCode();
    const rawResponse = response.getContentText();

    console.log(`Response Code: ${responseCode}`);
    console.log('Raw API Response:');
    console.log(rawResponse);

    if (responseCode === 200) {
      const data = JSON.parse(rawResponse);
      console.log(`\nParsed Results Count: ${data.items ? data.items.length : 0}`);
      if (data.items && data.items.length > 0) {
        console.log('First result:');
        console.log(`  Title: ${data.items[0].title}`);
        console.log(`  Link: ${data.items[0].link}`);
        console.log(`  Snippet: ${data.items[0].snippet}`);
      }
    }
  } catch (error) {
    console.error(`Search API test failed: ${error.message}`);
  }

  // -------------------------------------------------------------------------
  // TEST 2: parseCompanyName() with sample URLs
  // -------------------------------------------------------------------------
  console.log('\n--- TEST 2: parseCompanyName() ---');

  const companyTestCases = [
    {
      url: 'https://boards.greenhouse.io/stripe/jobs/12345',
      title: 'Senior Program Manager',
      snippet: 'Join our team...',
      expected: 'Stripe'
    },
    {
      url: 'https://jobs.lever.co/figma/67890',
      title: 'Program Manager',
      snippet: 'Design tool company...',
      expected: 'Figma'
    }
  ];

  for (const testCase of companyTestCases) {
    const result = parseCompanyName(testCase.url, testCase.title, testCase.snippet);
    const status = result.toLowerCase() === testCase.expected.toLowerCase() ? '✓' : '✗';
    console.log(`\n${status} URL: ${testCase.url}`);
    console.log(`  Expected: ${testCase.expected}`);
    console.log(`  Result:   ${result}`);
  }

  // -------------------------------------------------------------------------
  // TEST 3: parseSalary() with sample snippets
  // -------------------------------------------------------------------------
  console.log('\n--- TEST 3: parseSalary() ---');

  const salaryTestCases = [
    {
      snippet: '$120,000 - $150,000 per year',
      title: 'Program Manager',
      description: 'Standard salary range'
    },
    {
      snippet: 'Zone 1: $180K | Zone 2: $150K | Zone 3: $120K',
      title: 'Remote Program Manager',
      description: 'Multi-zone salary (should detect Zone 2 for Austin)'
    },
    {
      snippet: 'Competitive salary',
      title: 'Program Manager',
      description: 'No salary listed'
    }
  ];

  for (const testCase of salaryTestCases) {
    const result = parseSalary(testCase.snippet, testCase.title);
    console.log(`\nTest: ${testCase.description}`);
    console.log(`  Snippet: "${testCase.snippet}"`);
    console.log(`  Title:   "${testCase.title}"`);
    console.log(`  Result:  ${result}`);
  }

  // -------------------------------------------------------------------------
  // TEST 4: parseLocationType() with sample text
  // -------------------------------------------------------------------------
  console.log('\n--- TEST 4: parseLocationType() ---');

  const locationTestCases = [
    {
      snippet: 'This is a remote position based in Austin, TX',
      title: 'Program Manager',
      description: 'Remote position with Austin mentioned'
    }
  ];

  for (const testCase of locationTestCases) {
    const result = parseLocationType(testCase.snippet, testCase.title);
    console.log(`\nTest: ${testCase.description}`);
    console.log(`  Snippet: "${testCase.snippet}"`);
    console.log(`  Title:   "${testCase.title}"`);
    console.log(`  Result:  ${result}`);
  }

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log('\n' + '='.repeat(60));
  console.log('TEST COMPLETE');
  console.log('='.repeat(60));
  console.log('Review the output above to verify each function works correctly.');
}
