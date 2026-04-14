create table users (
    id bigserial primary key,
    name varchar(255) not null,
    email varchar(255) not null unique,
    password varchar(255),
    provider varchar(32) not null
);
