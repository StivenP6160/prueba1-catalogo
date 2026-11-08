SET NAMES utf8mb4;

INSERT INTO categories (name) VALUES
  ('Camisetas'),
  ('Pantalones'),
  ('Calzado');

INSERT INTO products (sku, name, description, price, stock, category_id) VALUES
  ('CAM-001', 'Camiseta básica blanca', 'Camiseta 100% algodón', 39900, 50, 1),
  ('CAM-002', 'Camiseta básica negra',  'Camiseta 100% algodón', 39900, 35, 1),
  ('CAM-003', 'Camiseta estampada',     'Estampado frontal',     54900, 20, 1),
  ('CAM-004', 'Camiseta polo azul',     'Cuello polo',           69900, 3,  1),
  ('PAN-001', 'Jean clásico',           'Corte recto',           129900, 15, 2),
  ('PAN-002', 'Jogger gris',            'Tela perchada',         89900, 25, 2),
  ('PAN-003', 'Pantalón de dril',       'Color caqui',           109900, 0,  2),
  ('CAL-001', 'Tenis blancos',          'Suela de caucho',       189900, 12, 3),
  ('CAL-002', 'Botas de cuero',         'Cuero genuino',         289900, 6,  3),
  ('CAL-003', 'Sandalias',              'Para playa',            49900, 40, 3);