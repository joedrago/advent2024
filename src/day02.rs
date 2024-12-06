fn parse_report(line: &str) -> Vec<i32> {
    let nums = line.split_whitespace();
    let mut report = Vec::<i32>::new();

    for num_string in nums {
        let num = num_string.parse::<i32>().unwrap();
        report.push(num);
    }

    return report;
}

fn is_report_safe(report: &Vec<i32>, skip_index: Option<usize>) -> bool {
    let count = report.len();
    let mut detecting_increasing = true;
    let mut expecting_increasing = false;
    let mut prev = report[0];
    let mut i = 1;

    if skip_index.is_some() {
        if skip_index.unwrap() == 0 {
            prev = report[1];
            i += 1;
        }
    }

    while i < count {
        let curr = report[i];

        if skip_index.is_some() {
            if skip_index.unwrap() == i {
                i += 1;
                continue;
            }
        }

        if detecting_increasing {
            detecting_increasing = false;
            expecting_increasing = prev < curr;
        } else {
            let is_increasing = prev < curr;
            if is_increasing != expecting_increasing {
                return false;
            }
        }

        let diff = (prev - curr).abs();
        if diff < 1 || diff > 3 {
            return false;
        }

        prev = curr;
        i += 1;
    }

    return true;
}

fn is_dampened_report_safe(report: &Vec<i32>) -> bool {
    let count = report.len();
    for i in 0..count {
        if is_report_safe(report, Some(i)) {
            return true;
        }
    }

    return false;
}

pub fn main(contents: String) {
    let mut safe_count = 0;
    let mut dampened_count = 0;
    let mut total_count = 0;

    for line in contents.lines() {
        let report = parse_report(line);
        if report.len() == 0 {
            continue;
        }

        if is_report_safe(&report, None) {
            safe_count += 1;
        } else if is_dampened_report_safe(&report) {
            dampened_count += 1;
        }

        total_count += 1;
    }

    println!("Safe (basic)   : {}", safe_count);
    println!("Safe (dampened): {}", dampened_count);
    println!("Safe (combined): {}", safe_count + dampened_count);
    println!("Total          : {}", total_count);
}
