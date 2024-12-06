use std::env;
use std::fs;

mod day01;
mod day02;

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 3 {
        println!("Syntax: day input.txt");
        return;
    }

    let day = &args[1];
    let input_filename = &args[2];
    let contents = fs::read_to_string(input_filename).expect("Cant read input");
    match day.as_str() {
        "day01" | "1" => day01::main(contents),
        "day02" | "2" => day02::main(contents),

        _ => println!("Unknown day '{}'", day),
    }
}
