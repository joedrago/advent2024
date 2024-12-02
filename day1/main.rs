use std::collections::HashMap;
use std::env;
use std::fs;

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        println!("Syntax: day1 [input.txt]");
        return;
    }

    let input_filename = &args[1];
    let contents = fs::read_to_string(input_filename).expect("Cant read input");
    let lines = contents.lines();

    let mut list_l = Vec::new();
    let mut list_r = Vec::new();
    let mut count_r = HashMap::new();

    for line in lines {
        let pieces: Vec<&str> = line.split_whitespace().collect();
        if pieces.len() != 2 {
            continue;
        }

        let l = pieces[0].parse::<i32>().unwrap();
        list_l.push(l);
        let r = pieces[1].parse::<i32>().unwrap();
        list_r.push(r);

        count_r.entry(r).and_modify(|n| *n += 1).or_insert(1);
    }
    list_l.sort();
    list_r.sort();

    let mut similarity_score = 0;
    let mut total_distance = 0;
    for i in 0..list_l.len() {
        let l = list_l[i];
        let r = list_r[i];
        let diff = (l - r).abs();
        total_distance += diff;

        let count = count_r.get(&l);
        if count != None {
            similarity_score += l * count.unwrap();
        }
    }

    println!("Total Distance  : {}", total_distance);
    println!("Similarity Score: {}", similarity_score);
}
